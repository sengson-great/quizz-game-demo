<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GameMatch;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class MultiplayerController extends Controller
{
    /**
     * Create a new battle lobby (for battle mode)
     */
    public function createBattle(Request $request)
    {
        $user = $request->user();
        
        $request->validate([
            'player_count' => 'required|integer|min:2|max:100',
            'is_private' => 'boolean'
        ]);
        
        $playerCount = $request->input('player_count');
        $isPrivate = $request->input('is_private', true);
        
        // Generate a unique invite code
        $inviteCode = strtoupper(Str::random(6)); // e.g., "AB7X9K"
        
        // Create battle lobby
        $battleId = (string) Str::uuid();
        
        // Store lobby in cache (expires in 1 hour)
        Cache::put("battle_lobby_{$inviteCode}", [
            'id' => $battleId,
            'host_id' => $user->id,
            'host_name' => $user->name,
            'player_count' => $playerCount,
            'is_private' => $isPrivate,
            'players' => [
                [
                    'id' => $user->id,
                    'name' => $user->name,
                    'joined_at' => now()->toDateTimeString(),
                    'ready' => false
                ]
            ],
            'status' => 'waiting',
            'created_at' => now()->toDateTimeString()
        ], now()->addHours(1));
        
        // Also store by battle ID for easy lookup
        Cache::put("battle_lobby_id_{$battleId}", $inviteCode, now()->addHours(1));
        
        return response()->json([
            'status' => 'created',
            'battle_id' => $battleId,
            'invite_code' => $inviteCode,
            'player_count' => $playerCount,
            'players' => [
                [
                    'id' => $user->id,
                    'name' => $user->name,
                    'host' => true
                ]
            ],
            'share_link' => url("/battle/join/{$inviteCode}"),
            'message' => "Share this code with friends: {$inviteCode}"
        ]);
    }
    
    /**
     * Join a battle using invite code
     */
    public function joinBattle(Request $request, $inviteCode)
    {
        $user = $request->user();
        
        return Cache::lock("lock_battle_lobby_{$inviteCode}", 5)->block(5, function () use ($user, $inviteCode) {
            // Get lobby from cache
            $lobby = Cache::get("battle_lobby_{$inviteCode}");
            
            if (!$lobby) {
                return response()->json([
                    'error' => 'Invalid or expired invite code'
                ], 404);
            }
            
            // Check if battle already started
            if ($lobby['status'] !== 'waiting') {
                return response()->json([
                    'error' => 'This battle has already started'
                ], 400);
            }
            
            // Check if user is already in the lobby
            foreach ($lobby['players'] as $player) {
                if ($player['id'] === $user->id) {
                    return response()->json([
                        'status' => 'already_joined',
                        'battle_id' => $lobby['id'],
                        'invite_code' => $inviteCode,
                        'players' => $lobby['players'],
                        'player_count' => $lobby['player_count']
                    ]);
                }
            }
            
            // Check if lobby is full
            if (count($lobby['players']) >= $lobby['player_count']) {
                return response()->json([
                    'error' => 'This battle is full'
                ], 400);
            }
            
            // Add user to lobby
            $lobby['players'][] = [
                'id' => $user->id,
                'name' => $user->name,
                'joined_at' => now()->toDateTimeString(),
                'ready' => false
            ];
            
            // Update cache
            Cache::put("battle_lobby_{$inviteCode}", $lobby, now()->addHours(1));
            
            // Notify all players in the lobby that someone joined
            try {
                foreach ($lobby['players'] as $player) {
                    broadcast(new \App\Events\BattleLobbyUpdate(
                        $player['id'],
                        $lobby['id'],
                        'player_joined',
                        [
                            'player' => [
                                'id' => $user->id,
                                'name' => $user->name
                            ],
                            'players' => $lobby['players'],
                            'current_count' => count($lobby['players']),
                            'needed' => $lobby['player_count'] - count($lobby['players'])
                        ]
                    ));
                }
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error('Lobby broadcast failed: ' . $e->getMessage());
            }
            
            return response()->json([
                'status' => 'joined',
                'battle_id' => $lobby['id'],
                'invite_code' => $inviteCode,
                'players' => $lobby['players'],
                'current_count' => count($lobby['players']),
                'needed' => $lobby['player_count'] - count($lobby['players']),
                'total_needed' => $lobby['player_count'],
                'is_host' => $user->id === $lobby['host_id']
            ]);
        });
    }
    
    /**
     * Get battle lobby info
     */
    public function getBattleLobby(Request $request, $inviteCode)
    {
        $user = $request->user();
        
        $lobby = Cache::get("battle_lobby_{$inviteCode}");
        
        if (!$lobby) {
            return response()->json([
                'error' => 'Battle lobby not found'
            ], 404);
        }
        
        return response()->json([
            'battle_id' => $lobby['id'],
            'invite_code' => $inviteCode,
            'host' => [
                'id' => $lobby['host_id'],
                'name' => $lobby['host_name']
            ],
            'players' => $lobby['players'],
            'current_count' => count($lobby['players']),
            'needed' => $lobby['player_count'] - count($lobby['players']),
            'total_needed' => $lobby['player_count'],
            'status' => $lobby['status'],
            'is_host' => $user->id === $lobby['host_id']
        ]);
    }
    
    /**
     * Set player ready status
     */
    public function setReady(Request $request, $inviteCode)
    {
        $user = $request->user();
        
        $request->validate([
            'ready' => 'required|boolean'
        ]);
        
        return Cache::lock("lock_battle_lobby_{$inviteCode}", 5)->block(5, function () use ($request, $user, $inviteCode) {
            $lobby = Cache::get("battle_lobby_{$inviteCode}");
            
            if (!$lobby) {
                return response()->json(['error' => 'Lobby not found'], 404);
            }
            
            // Update player ready status
            foreach ($lobby['players'] as &$player) {
                if ($player['id'] === $user->id) {
                    $player['ready'] = $request->input('ready');
                    break;
                }
            }
            
            Cache::put("battle_lobby_{$inviteCode}", $lobby, now()->addHours(1));
            
            // Notify all players
            try {
                foreach ($lobby['players'] as $player) {
                    broadcast(new \App\Events\BattleLobbyUpdate(
                        $player['id'],
                        $lobby['id'],
                        'player_ready',
                        [
                            'player_id' => $user->id,
                            'ready' => $request->input('ready'),
                            'players' => $lobby['players'],
                            'all_ready' => $this->areAllPlayersReady($lobby)
                        ]
                    ));
                }
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error('Lobby broadcast failed: ' . $e->getMessage());
            }
            
            return response()->json([
                'status' => 'updated',
                'ready' => $request->input('ready'),
                'all_ready' => $this->areAllPlayersReady($lobby)
            ]);
        });
    }
    
    /**
     * Start the battle (host only)
     */
    public function startBattle(Request $request, $inviteCode)
    {
        $user = $request->user();
        
        $lobby = Cache::get("battle_lobby_{$inviteCode}");
        
        if (!$lobby) {
            return response()->json(['error' => 'Lobby not found'], 404);
        }
        
        // Check if user is host
        if ($user->id !== $lobby['host_id']) {
            return response()->json(['error' => 'Only the host can start the battle'], 403);
        }
        
        // Check if enough players
        if (count($lobby['players']) < $lobby['player_count']) {
            return response()->json([
                'error' => 'Not enough players',
                'current' => count($lobby['players']),
                'needed' => $lobby['player_count']
            ], 400);
        }
        
        // Check if all players are ready (Requirement removed per user request)
        // $allReady = $this->areAllPlayersReady($lobby);
        // if (!$allReady) {
        //     return response()->json([
        //         'error' => 'Not all players are ready'
        //     ], 400);
        // }
        
        // Update lobby status
        $lobby['status'] = 'starting';
        Cache::put("battle_lobby_{$inviteCode}", $lobby, now()->addHours(1));
        
        // Create the actual battle match
        return $this->createBattleFromLobby($lobby, $inviteCode);
    }
    
    /**
     * Create battle match from lobby
     */
    private function createBattleFromLobby($lobby, $inviteCode)
    {
        $matchId = (string) Str::uuid();
        
        // Shuffle players for random order
        $players = $lobby['players'];
        shuffle($players);
        
        // Store match in database
        $match = GameMatch::create([
            'id' => $matchId,
            'mode' => 'battle',
            'players' => $players,
            'total_players' => $lobby['player_count'],
            'questions' => $this->generateMatchQuestions(),
            'status' => 'active',
            'started_at' => now()
        ]);
        
        // Clear the lobby
        Cache::forget("battle_lobby_{$inviteCode}");
        Cache::forget("battle_lobby_id_{$lobby['id']}");
        
        // Notify all players that battle is starting
        try {
            foreach ($players as $index => $player) {
                $otherPlayers = array_values(array_filter($players, function($p) use ($player) {
                    return $p['id'] !== $player['id'];
                }));
                
                broadcast(new \App\Events\BattleStarted(
                    $player['id'],
                    $matchId,
                    $otherPlayers,
                    $index + 1,
                    count($players)
                ));
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Battle start broadcast failed: ' . $e->getMessage());
        }
        
        return response()->json([
            'status' => 'started',
            'match_id' => $matchId,
            'mode' => 'battle',
            'players' => $players,
            'player_count' => count($players)
        ]);
    }
    
    /**
     * Check if all players are ready
     */
    private function areAllPlayersReady($lobby)
    {
        foreach ($lobby['players'] as $player) {
            if (!$player['ready']) {
                return false;
            }
        }
        return true;
    }
    
    /**
     * Leave battle lobby
     */
    public function leaveBattle(Request $request, $inviteCode)
    {
        $user = $request->user();
        
        return Cache::lock("lock_battle_lobby_{$inviteCode}", 5)->block(5, function () use ($user, $inviteCode) {
            $lobby = Cache::get("battle_lobby_{$inviteCode}");
            
            if (!$lobby) {
                return response()->json(['error' => 'Lobby not found'], 404);
            }
            
            // Remove user from players
            $lobby['players'] = array_values(array_filter($lobby['players'], function($player) use ($user) {
                return $player['id'] !== $user->id;
            }));
            
            // If no players left or host left, delete lobby
            if (empty($lobby['players']) || $user->id === $lobby['host_id']) {
                Cache::forget("battle_lobby_{$inviteCode}");
                Cache::forget("battle_lobby_id_{$lobby['id']}");
                
                // Notify remaining players that lobby was closed
                if (!empty($lobby['players'])) {
                    foreach ($lobby['players'] as $player) {
                        broadcast(new \App\Events\BattleLobbyClosed(
                            $player['id'],
                            $lobby['id']
                        ));
                    }
                }
            } else {
                // Save updated lobby
                Cache::put("battle_lobby_{$inviteCode}", $lobby, now()->addHours(1));
                
                // Notify others that player left
                try {
                    foreach ($lobby['players'] as $player) {
                        broadcast(new \App\Events\BattleLobbyUpdate(
                            $player['id'],
                            $lobby['id'],
                            'player_left',
                            [
                                'player_id' => $user->id,
                                'players' => $lobby['players'],
                                'current_count' => count($lobby['players']),
                                'needed' => $lobby['player_count'] - count($lobby['players'])
                            ]
                        ));
                    }
                } catch (\Exception $e) {
                    \Illuminate\Support\Facades\Log::error('Lobby broadcast failed: ' . $e->getMessage());
                }
            }
            
            return response()->json(['status' => 'left']);
        });
    }
    
    /**
     * Original 1v1 matchmaking (keep as is)
     */
    public function matchmake(Request $request)
    {
        $user = $request->user();
        
        $request->validate([
            'mode' => 'required|in:1v1'
        ]);
        
        return $this->matchmake1v1($user);
    }
    
    /**
     * 1v1 Matchmaking
     */
    private function matchmake1v1($user)
    {
        $queue = Cache::get('matchmaking_queue_1v1');
        
        if ($queue && $queue['id'] !== $user->id) {
            // Found a match
            $matchId = (string) Str::uuid();
            $opponent = $queue;
            
            Cache::forget('matchmaking_queue_1v1');
            
            GameMatch::create([
                'id' => $matchId,
                'mode' => '1v1',
                'players' => [
                    ['id' => $user->id, 'name' => $user->name],
                    ['id' => $opponent['id'], 'name' => $opponent['name']]
                ],
                'questions' => $this->generateMatchQuestions(),
                'status' => 'active'
            ]);

            try {
                broadcast(new \App\Events\MatchFound($user->id, $matchId, $opponent));
                broadcast(new \App\Events\MatchFound($opponent['id'], $matchId, [
                    'id' => $user->id,
                    'name' => $user->name,
                ]));
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error('Broadcasting failed: ' . $e->getMessage());
            }
            
            return response()->json([
                'status' => 'matched',
                'match_id' => $matchId,
                'mode' => '1v1',
                'opponent' => $opponent
            ]);
        }
        
        // Add to 1v1 queue
        Cache::put('matchmaking_queue_1v1', [
            'id' => $user->id,
            'name' => $user->name,
        ], now()->addMinutes(5));
        
        return response()->json([
            'status' => 'queued',
            'mode' => '1v1'
        ]);
    }
    
    /**
     * Generate 15 questions, one for each difficulty level
     */
    private function generateMatchQuestions()
    {
        $questions = [];
        for ($level = 1; $level <= 15; $level++) {
            $question = \App\Models\Question::where('difficulty_level', $level)
                ->inRandomOrder()
                ->first();
            
            if ($question) {
                $questions[$level] = $question->id;
            }
        }
        return $questions;
    }

    /**
     * Send game action to other players in the match
     */
    public function sendAction(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'match_id'    => 'required|string',
            'action_type' => 'required|string',
            'payload'     => 'required|array',
        ]);

        $matchId    = $request->input('match_id');
        $actionType = $request->input('action_type');
        $payload    = $request->input('payload');

        // Add sender identity so receivers can filter their own events
        $payload['sender_id']   = $user->id;
        $payload['sender_name'] = $user->name;

        // Broadcast to ALL players subscribed to this match channel
        broadcast(new \App\Events\GameAction($matchId, $user->id, $actionType, $payload));

        return response()->json(['status' => 'sent']);
    }

    /**
     * Cancel matchmaking (1v1 only)
     */
    public function cancelMatchmake(Request $request)
    {
        $user = $request->user();
        
        $queue = Cache::get('matchmaking_queue_1v1');
        if ($queue && $queue['id'] === $user->id) {
            Cache::forget('matchmaking_queue_1v1');
        }
        
        return response()->json(['status' => 'cancelled']);
    }

    /**
     * HTTP Fallback: Get all scores for a match
     */
    public function getScores($matchId)
    {
        $sessions = \App\Models\GameSession::where('match_id', $matchId)
            ->select('user_id', 'score')
            ->get();
            
        $scores = [];
        foreach ($sessions as $session) {
            $scores[$session->user_id] = $session->score;
        }
        
        return response()->json($scores);
    }
    
    /**
     * Debug: View match payload
     */
    public function debugMatch($matchId)
    {
        if (config('app.env') !== 'local' && config('app.env') !== 'development') {
            // Allow in demo but ideally protect it
        }
        $match = GameMatch::find($matchId);
        return response()->json($match);
    }
}