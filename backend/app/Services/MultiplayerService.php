<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\User;
use App\Models\GameMatch;
use App\Models\Question;
use App\Events\BattleLobbyUpdate;
use App\Events\BattleLobbyClosed;
use App\Events\MatchFound;
use App\Events\BattleStarted;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class MultiplayerService
{
    /**
     * Create a new battle lobby.
     */
    public function createLobby(User $user, int $playerCount, bool $isPrivate): array
    {
        return Cache::lock('create_lobby_lock', 5)->block(5, function () use ($user, $playerCount, $isPrivate) {
            if (!$isPrivate) {
                $publicLobbies = Cache::get('public_lobbies', []);
                $validLobbies = [];
                $joinableLobbyCode = null;

                foreach ($publicLobbies as $code) {
                    $lobby = Cache::get("battle_lobby_{$code}");
                    if ($lobby && $lobby['status'] === 'waiting') {
                        // Purge any ghosts (no ping in last 15 seconds)
                        $currentTime = now()->timestamp;
                        $activePlayers = [];
                        $hasChanges = false;
                        
                        foreach ($lobby['players'] as $p) {
                            if (!isset($p['last_ping']) || ($currentTime - $p['last_ping'] <= 15)) {
                                $activePlayers[] = $p;
                            } else {
                                $hasChanges = true;
                                $this->broadcastLobbyUpdate($lobby, 'player_left', ['player_id' => $p['id']]);
                            }
                        }

                        if ($hasChanges) {
                            $lobby['players'] = array_values($activePlayers);
                            
                            if (empty($lobby['players'])) {
                                Cache::forget("battle_lobby_{$code}");
                                Cache::forget("battle_lobby_id_{$lobby['id']}");
                                continue; // Lobby destroyed, don't add to validLobbies
                            } else {
                                // Reassign host if previous host was purged
                                $hostStillActive = false;
                                foreach ($lobby['players'] as $p) {
                                    if ($p['id'] === $lobby['host_id']) { $hostStillActive = true; break; }
                                }
                                
                                if (!$hostStillActive) {
                                    $newHost = $lobby['players'][0];
                                    $lobby['host_id'] = $newHost['id'];
                                    $lobby['host_name'] = $newHost['name'];
                                    $lobby['host_avatar'] = $newHost['avatar'];
                                    foreach ($lobby['players'] as &$p) {
                                        if ($p['id'] === $newHost['id']) {
                                            $p['host'] = true;
                                        }
                                    }
                                }
                                Cache::put("battle_lobby_{$code}", $lobby, now()->addHours(1));
                            }
                        }

                        // Check if lobby is valid and has space to join
                        if (count($lobby['players']) < $lobby['player_count']) {
                            $validLobbies[] = $code;
                            if (!$joinableLobbyCode) {
                                $joinableLobbyCode = $code;
                            }
                        }
                    }
                }
                Cache::put('public_lobbies', $validLobbies, now()->addHours(1));

                if ($joinableLobbyCode) {
                    $inviteCode = $joinableLobbyCode;
                    try {
                        $lobby = $this->joinLobby($user, $inviteCode);
                        return [
                            'battle_id' => $lobby['id'],
                            'invite_code' => $inviteCode,
                            'player_count' => $lobby['player_count'],
                            'players' => $lobby['players'],
                            'share_link' => url("/battle/join/{$inviteCode}"),
                            'is_host' => false
                        ];
                    } catch (\Exception $e) {
                        // Proceed to create a new one if join fails
                    }
                }
            }

            $inviteCode = strtoupper(Str::random(6));
            $battleId = (string) Str::uuid();
            
            $lobbyData = [
                'id' => $battleId,
                'host_id' => $user->id,
                'host_name' => $user->name,
                'host_avatar' => $user->avatar,
                'player_count' => $playerCount,
                'is_private' => $isPrivate,
                'players' => [
                    [
                        'id' => $user->id,
                        'name' => $user->name,
                        'avatar' => $user->avatar,
                        'joined_at' => now()->toDateTimeString(),
                        'ready' => false,
                        'last_ping' => now()->timestamp
                    ]
                ],
                'status' => 'waiting',
                'created_at' => now()->toDateTimeString()
            ];

            Cache::put("battle_lobby_{$inviteCode}", $lobbyData, now()->addHours(1));
            Cache::put("battle_lobby_id_{$battleId}", $inviteCode, now()->addHours(1));

            if (!$isPrivate) {
                $publicLobbies = Cache::get('public_lobbies', []);
                $publicLobbies[] = $inviteCode;
                Cache::put('public_lobbies', $publicLobbies, now()->addHours(1));
            }

            return [
                'battle_id' => $battleId,
                'invite_code' => $inviteCode,
                'player_count' => $playerCount,
                'players' => [[
                    'id' => $user->id,
                    'name' => $user->name,
                    'avatar' => $user->avatar,
                    'host' => true,
                    'last_ping' => now()->timestamp
                ]],
                'share_link' => url("/battle/join/{$inviteCode}"),
                'is_host' => true
            ];
        });
    }

    /**
     * Join a battle lobby.
     */
    public function joinLobby(User $user, string $inviteCode): array
    {
        return Cache::lock("lock_battle_lobby_{$inviteCode}", 5)->block(5, function () use ($user, $inviteCode) {
            $lobby = Cache::get("battle_lobby_{$inviteCode}");
            
            if (!$lobby) {
                throw new \Exception('Invalid or expired invite code', 404);
            }
            
            if ($lobby['status'] !== 'waiting') {
                throw new \Exception('This battle has already started', 400);
            }
            
            // Check if user already in
            foreach ($lobby['players'] as $player) {
                if ($player['id'] === $user->id) {
                    return array_merge($lobby, ['status' => 'already_joined']);
                }
            }
            
            if (count($lobby['players']) >= $lobby['player_count']) {
                throw new \Exception('This battle is full', 400);
            }
            
            $newPlayer = [
                'id' => $user->id,
                'name' => $user->name,
                'avatar' => $user->avatar,
                'joined_at' => now()->toDateTimeString(),
                'ready' => false,
                'last_ping' => now()->timestamp
            ];
            
            $lobby['players'][] = $newPlayer;
            Cache::put("battle_lobby_{$inviteCode}", $lobby, now()->addHours(1));
            
            $this->broadcastLobbyUpdate($lobby, 'player_joined', [
                'player' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'avatar' => $user->avatar
                ]
            ]);

            return $lobby;
        });
    }

    /**
     * Set ready status.
     */
    public function setReady(User $user, string $inviteCode, bool $ready): array
    {
        return Cache::lock("lock_battle_lobby_{$inviteCode}", 5)->block(5, function () use ($user, $inviteCode, $ready) {
            $lobby = Cache::get("battle_lobby_{$inviteCode}");
            
            if (!$lobby) {
                throw new \Exception('Lobby not found', 404);
            }
            
            foreach ($lobby['players'] as &$player) {
                if ($player['id'] === $user->id) {
                    $player['ready'] = $ready;
                    break;
                }
            }
            
            Cache::put("battle_lobby_{$inviteCode}", $lobby, now()->addHours(1));
            
            $allReady = $this->areAllPlayersReady($lobby);
            $this->broadcastLobbyUpdate($lobby, 'player_ready', [
                'player_id' => $user->id,
                'ready' => $ready,
                'all_ready' => $allReady
            ]);

            return ['ready' => $ready, 'all_ready' => $allReady];
        });
    }

    /**
     * Start battle.
     */
    public function startBattle(User $user, string $inviteCode): array
    {
        $lobby = Cache::get("battle_lobby_{$inviteCode}");
        
        if (!$lobby) {
            throw new \Exception('Lobby not found', 404);
        }
        
        if ($user->id !== $lobby['host_id']) {
            throw new \Exception('Only the host can start the battle', 403);
        }
        
        if (count($lobby['players']) < 2) {
            throw new \Exception('Need at least 2 players to start a battle', 400);
        }
        
        $lobby['status'] = 'starting';
        Cache::put("battle_lobby_{$inviteCode}", $lobby, now()->addHours(1));
        
        return $this->createMatchFromLobby($lobby, $inviteCode);
    }

    /**
     * Leave lobby.
     */
    public function leaveLobby(User $user, string $inviteCode): void
    {
        // Try to acquire lock immediately; if contested, wait 200ms and retry once rather than blocking 5s
        $lock = Cache::lock("lock_battle_lobby_{$inviteCode}", 2);
        if (!$lock->get()) {
            usleep(200000);
            if (!$lock->get()) return; // Give up rather than hanging
        }
        try {
            $lobby = Cache::get("battle_lobby_{$inviteCode}");
            
            if (!$lobby) return;
            
            $lobby['players'] = array_values(array_filter($lobby['players'], fn($p) => $p['id'] !== $user->id));
            
            if (empty($lobby['players'])) {
                Cache::forget("battle_lobby_{$inviteCode}");
                Cache::forget("battle_lobby_id_{$lobby['id']}");
            } else {
                if ($user->id === $lobby['host_id']) {
                    $newHost = $lobby['players'][0];
                    $lobby['host_id'] = $newHost['id'];
                    $lobby['host_name'] = $newHost['name'];
                    $lobby['host_avatar'] = $newHost['avatar'];
                    foreach ($lobby['players'] as &$p) {
                        if ($p['id'] === $newHost['id']) {
                            $p['host'] = true;
                        }
                    }
                }
                Cache::put("battle_lobby_{$inviteCode}", $lobby, now()->addHours(1));
                $this->broadcastLobbyUpdate($lobby, 'player_left', [
                    'player_id' => $user->id,
                    'new_host_id' => $lobby['host_id']
                ]);
            }
        } finally {
            $lock->release();
        }
    }

    /**
     * Update heartbeat for a lobby player and evict ghosts.
     */
    public function pingLobby(User $user, string $inviteCode): void
    {
        // Non-blocking: skip this ping cycle if another request holds the lock
        $lock = Cache::lock("lock_battle_lobby_{$inviteCode}", 2);
        if (!$lock->get()) return;
        try {
            $lobby = Cache::get("battle_lobby_{$inviteCode}");
            
            if (!$lobby) return;

            $currentTime = now()->timestamp;
            $activePlayers = [];
            $ghostIds = [];

            // Refresh this user's ping, and collect ghosts
            foreach ($lobby['players'] as &$p) {
                if ($p['id'] === $user->id) {
                    $p['last_ping'] = $currentTime;
                }
            }
            unset($p);

            // Separate ghosts from active players (>8s without a ping)
            foreach ($lobby['players'] as $p) {
                if (isset($p['last_ping']) && ($currentTime - $p['last_ping']) > 8) {
                    $ghostIds[] = $p['id'];
                } else {
                    $activePlayers[] = $p;
                }
            }

            if (empty($ghostIds)) {
                // No ghosts, just persist the updated ping timestamp
                Cache::put("battle_lobby_{$inviteCode}", $lobby, now()->addHours(1));
                return;
            }

            // Ghosts found — evict them
            $lobby['players'] = array_values($activePlayers);

            if (empty($lobby['players'])) {
                Cache::forget("battle_lobby_{$inviteCode}");
                Cache::forget("battle_lobby_id_{$lobby['id']}");
                return;
            }

            // Reassign host if the host was evicted
            $hostStillActive = false;
            foreach ($lobby['players'] as $p) {
                if ($p['id'] === $lobby['host_id']) { $hostStillActive = true; break; }
            }

            if (!$hostStillActive) {
                $newHost = $lobby['players'][0];
                $lobby['host_id'] = $newHost['id'];
                $lobby['host_name'] = $newHost['name'];
                $lobby['host_avatar'] = $newHost['avatar'];
                foreach ($lobby['players'] as &$p) {
                    if ($p['id'] === $newHost['id']) { $p['host'] = true; }
                }
                unset($p);
            }

            Cache::put("battle_lobby_{$inviteCode}", $lobby, now()->addHours(1));

            // Broadcast one update with the full, clean player list
            foreach ($ghostIds as $ghostId) {
                $this->broadcastLobbyUpdate($lobby, 'player_left', [
                    'player_id'   => $ghostId,
                    'new_host_id' => $lobby['host_id'],
                ]);
            }
        } finally {
            $lock->release();
        }
    }

    /**
     * 1v1 Matchmaking.
     */
    public function matchmake1v1(User $user): array
    {
        $queue = Cache::get('matchmaking_queue_1v1');
        
        if ($queue && $queue['id'] !== $user->id) {
            $matchId = (string) Str::uuid();
            $opponent = $queue;
            
            Cache::forget('matchmaking_queue_1v1');
            
            GameMatch::create([
                'id' => $matchId,
                'mode' => '1v1',
                'players' => [
                    ['id' => $user->id, 'name' => $user->name, 'avatar' => $user->avatar],
                    ['id' => $opponent['id'], 'name' => $opponent['name'], 'avatar' => $opponent['avatar']]
                ],
                'questions' => $this->generateMatchQuestions(),
                'status' => 'active'
            ]);

            try {
                broadcast(new MatchFound($user->id, $matchId, $opponent));
                broadcast(new MatchFound($opponent['id'], $matchId, [
                    'id' => $user->id,
                    'name' => $user->name, 'avatar' => $user->avatar,
                ]));
            } catch (\Exception $e) {
                Log::error('Broadcasting failed: ' . $e->getMessage());
            }
            
            return [
                'status' => 'matched',
                'match_id' => $matchId,
                'opponent' => $opponent
            ];
        }
        
        Cache::put('matchmaking_queue_1v1', [
            'id' => $user->id,
            'name' => $user->name,
            'avatar' => $user->avatar,
        ], now()->addMinutes(5));
        
        return ['status' => 'queued'];
    }

    private function createMatchFromLobby(array $lobby, string $inviteCode): array
    {
        $matchId = (string) Str::uuid();
        $players = $lobby['players'];
        shuffle($players);
        
        GameMatch::create([
            'id' => $matchId,
            'mode' => 'battle',
            'players' => $players,
            'total_players' => $lobby['player_count'],
            'questions' => $this->generateMatchQuestions(),
            'status' => 'active',
            'started_at' => now()
        ]);
        
        Cache::forget("battle_lobby_{$inviteCode}");
        Cache::forget("battle_lobby_id_{$lobby['id']}");
        
        foreach ($players as $index => $player) {
            $otherPlayers = array_values(array_filter($players, fn($p) => $p['id'] !== $player['id']));
            broadcast(new BattleStarted($player['id'], $matchId, $otherPlayers, $index + 1, count($players)));
        }
        
        return [
            'status' => 'started',
            'match_id' => $matchId,
            'players' => $players
        ];
    }

    private function generateMatchQuestions(): array
    {
        $questions = [];
        $usedIds = [];
        for ($level = 1; $level <= 15; $level++) {
            $difficulty = match (true) {
                $level <= 5 => 'easy',
                $level <= 10 => 'medium',
                default => 'hard',
            };

            $query = Question::where('difficulty_level', $difficulty);
            if (!empty($usedIds)) {
                $query->whereNotIn('id', $usedIds);
            }

            $question = $query->inRandomOrder()->first();
            
            if ($question) {
                $questions[$level] = $question->id;
                $usedIds[] = $question->id;
            } else {
                // Fallback if we run out of unique questions of this difficulty
                $fallback = Question::whereNotIn('id', $usedIds)->inRandomOrder()->first();
                if ($fallback) {
                    $questions[$level] = $fallback->id;
                    $usedIds[] = $fallback->id;
                }
            }
        }
        return $questions;
    }

    private function broadcastLobbyUpdate(array $lobby, string $type, array $payload): void
    {
        try {
            foreach ($lobby['players'] as $player) {
                broadcast(new BattleLobbyUpdate(
                    $player['id'],
                    $lobby['id'],
                    $type,
                    array_merge($payload, [
                        'players' => $lobby['players'],
                        'current_count' => count($lobby['players']),
                        'needed' => $lobby['player_count'] - count($lobby['players'])
                    ])
                ));
            }
        } catch (\Exception $e) {
            Log::error('Lobby broadcast failed: ' . $e->getMessage());
        }
    }

    private function areAllPlayersReady(array $lobby): bool
    {
        foreach ($lobby['players'] as $player) {
            if (!$player['ready']) return false;
        }
        return true;
    }
}
