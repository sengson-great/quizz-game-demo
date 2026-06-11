<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GameMatch;
use App\Services\MultiplayerService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use OpenApi\Attributes as OA;

class MultiplayerController extends Controller
{
    public function __construct(protected MultiplayerService $service) {}

    #[OA\Post(path: "/multiplayer/battle/create", summary: "Create a new battle lobby", tags: ["Multiplayer"])]
    #[OA\Response(response: 200, description: "Battle lobby created successfully")]
    public function createBattle(Request $request)
    {
        $request->validate([
            'player_count' => 'required|integer|min:2|max:100',
            'is_private' => 'boolean',
            'categories' => 'nullable|array'
        ]);

        $result = $this->service->createLobby(
            $request->user(),
            (int) $request->player_count,
            (bool) $request->get('is_private', true),
            $request->get('categories', [])
        );

        return $this->successResponse($result, 'Battle lobby created');
    }

    #[OA\Post(path: "/multiplayer/battle/join/{inviteCode}", summary: "Join a battle lobby", tags: ["Multiplayer"])]
    #[OA\Response(response: 200, description: "Joined lobby successfully")]
    #[OA\Response(response: 400, description: "Failed to join lobby")]
    public function joinBattle(Request $request, $inviteCode)
    {
        try {
            $lobby = $this->service->joinLobby($request->user(), $inviteCode);
            
            $response = [
                'battle_id' => $lobby['id'] ?? null,
                'invite_code' => $inviteCode,
                'player_count' => $lobby['player_count'] ?? 0,
                'total_needed' => $lobby['player_count'] ?? 0,
                'players' => $lobby['players'] ?? [],
                'is_host' => $request->user()->id === ($lobby['host_id'] ?? null)
            ];

            return $this->successResponse($response, 'Joined successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), (int) $e->getCode() ?: 400);
        }
    }

    #[OA\Get(path: "/multiplayer/battle/lobby/{inviteCode}", summary: "Get battle lobby details", tags: ["Multiplayer"])]
    #[OA\Response(response: 200, description: "Lobby details retrieved")]
    #[OA\Response(response: 404, description: "Lobby not found")]
    public function getBattleLobby(Request $request, $inviteCode)
    {
        $lobby = \Illuminate\Support\Facades\Cache::get("battle_lobby_{$inviteCode}");
        if (!$lobby) return $this->errorResponse('Battle lobby not found', 404);

        return $this->successResponse([
            'battle_id' => $lobby['id'],
            'invite_code' => $inviteCode,
            'host' => ['id' => $lobby['host_id'], 'name' => $lobby['host_name']],
            'players' => $lobby['players'],
            'current_count' => count($lobby['players']),
            'needed' => $lobby['player_count'] - count($lobby['players']),
            'total_needed' => $lobby['player_count'],
            'status' => $lobby['status'],
            'is_host' => $request->user()->id === $lobby['host_id'],
            'match_id' => $lobby['match_id'] ?? null,
        ]);
    }

    #[OA\Post(path: "/multiplayer/battle/ready/{inviteCode}", summary: "Set player ready status", tags: ["Multiplayer"])]
    #[OA\Response(response: 200, description: "Ready status updated successfully")]
    #[OA\Response(response: 400, description: "Failed to update ready status")]
    public function setReady(Request $request, $inviteCode)
    {
        $request->validate(['ready' => 'required|boolean']);
        try {
            $result = $this->service->setReady($request->user(), $inviteCode, $request->ready);
            return $this->successResponse($result, 'Ready status updated');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), (int) $e->getCode() ?: 400);
        }
    }

    #[OA\Post(path: "/multiplayer/battle/start/{inviteCode}", summary: "Start the battle (host only)", tags: ["Multiplayer"])]
    #[OA\Response(response: 200, description: "Battle started successfully")]
    #[OA\Response(response: 400, description: "Failed to start battle")]
    public function startBattle(Request $request, $inviteCode)
    {
        try {
            $result = $this->service->startBattle($request->user(), $inviteCode);
            return $this->successResponse($result, 'Battle started');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), (int) $e->getCode() ?: 400);
        }
    }

    #[OA\Post(path: "/multiplayer/battle/leave/{inviteCode}", summary: "Leave battle lobby", tags: ["Multiplayer"])]
    #[OA\Response(response: 200, description: "Left lobby successfully")]
    public function leaveBattle(Request $request, $inviteCode)
    {
        $this->service->leaveLobby($request->user(), $inviteCode);
        return $this->successResponse(null, 'Left successfully');
    }

    #[OA\Post(path: "/multiplayer/battle/ping/{inviteCode}", summary: "Send heartbeat to keep presence in lobby", tags: ["Multiplayer"])]
    #[OA\Response(response: 200, description: "Presence heartbeat received")]
    public function pingLobby(Request $request, $inviteCode)
    {
        $this->service->pingLobby($request->user(), $inviteCode);
        return $this->successResponse(null, 'Ping received');
    }

    #[OA\Post(path: "/multiplayer/matchmake", summary: "Enter 1v1 matchmaking", tags: ["Multiplayer"])]
    #[OA\Response(response: 200, description: "Matchmaking queue entered")]
    public function matchmake(Request $request)
    {
        $request->validate([
            'mode' => 'required|in:1v1',
            'categories' => 'nullable|array'
        ]);
        $result = $this->service->matchmake1v1($request->user(), $request->get('categories', []));
        return $this->successResponse($result);
    }

    #[OA\Post(path: "/multiplayer/action", summary: "Send game action to other players", tags: ["Multiplayer"])]
    #[OA\Response(response: 200, description: "Action broadcasted successfully")]
    #[OA\Response(response: 500, description: "Failed to broadcast action")]
    public function sendAction(Request $request)
    {
        $request->validate([
            'match_id'    => 'required|string',
            'action_type' => 'required|string',
            'payload'     => 'required|array',
        ]);

        $payload = $request->input('payload');
        $payload['sender_id'] = $request->user()->id;
        $payload['sender_name'] = $request->user()->name;

        if ($request->action_type === 'player_left') {
            try {
                $session = \App\Models\GameSession::where('match_id', $request->match_id)
                    ->where('user_id', $request->user()->id)
                    ->first();
                if ($session) {
                    $newScore = max(0, $session->score - 2000);
                    $session->update([
                        'status' => 'failed',
                        'score' => $newScore
                    ]);
                    $payload['score'] = $newScore;
                }
                
                // Get all game sessions for this match
                $sessions = \App\Models\GameSession::where('match_id', $request->match_id)->get();
                // A session is not forfeited if status is NOT 'failed'
                $nonFailedSessions = $sessions->filter(fn($s) => $s->status !== 'failed');
                
                if ($nonFailedSessions->count() === 1) {
                    $lastRemainingSession = $nonFailedSessions->first();
                    if ($lastRemainingSession->status === 'active') {
                        $lastRemainingSession->update([
                            'status' => 'completed'
                        ]);
                    }
                    // Signal the broadcast that the last player wins by forfeit
                    $payload['last_remaining_wins'] = true;
                    $payload['winning_user_id'] = $lastRemainingSession->user_id;
                }
            } catch (\Exception $e) {
                Log::error('Forfeit penalty processing failed: ' . $e->getMessage());
            }
        }

        try {
            broadcast(new \App\Events\GameAction($request->match_id, $request->user()->id, $request->action_type, $payload));
            return $this->successResponse(null, 'Action sent');
        } catch (\Exception $e) {
            Log::error('GameAction broadcast failed: ' . $e->getMessage());
            return $this->errorResponse('Failed to send action', 500);
        }
    }

    #[OA\Post(path: "/multiplayer/cancel-matchmake", summary: "Cancel 1v1 matchmaking", tags: ["Multiplayer"])]
    #[OA\Response(response: 200, description: "Matchmaking queue cancelled")]
    public function cancelMatchmake(Request $request)
    {
        $user = $request->user();
        $queueKey = \Illuminate\Support\Facades\Cache::get('user_matchmake_key_' . $user->id);
        if ($queueKey) {
            $queue = \Illuminate\Support\Facades\Cache::get($queueKey);
            if ($queue && $queue['id'] === $user->id) {
                \Illuminate\Support\Facades\Cache::forget($queueKey);
            }
            \Illuminate\Support\Facades\Cache::forget('user_matchmake_key_' . $user->id);
        } else {
            // Fallback for legacy
            $queue = \Illuminate\Support\Facades\Cache::get('matchmaking_queue_1v1');
            if ($queue && $queue['id'] === $user->id) {
                \Illuminate\Support\Facades\Cache::forget('matchmaking_queue_1v1');
            }
        }
        return $this->successResponse(null, 'Cancelled');
    }

    #[OA\Get(path: "/multiplayer/scores/{matchId}", summary: "Get all scores and statuses for a match", tags: ["Multiplayer"])]
    #[OA\Response(response: 200, description: "Scores and player session statuses")]
    public function getScores($matchId)
    {
        $sessions = \App\Models\GameSession::where('match_id', $matchId)
            ->get(['user_id', 'score', 'status']);

        $scores   = $sessions->pluck('score', 'user_id');
        $statuses = $sessions->pluck('status', 'user_id');
        // A player is "done" if their session is completed or failed (not still active)
        $done     = $sessions->mapWithKeys(fn($s) => [$s->user_id => in_array($s->status, ['completed', 'failed'])]);

        return $this->successResponse([
            'scores'   => $scores,
            'statuses' => $statuses,
            'done'     => $done,
        ]);
    }

    /**
     * HTTP polling fallback: let the queued player check if they've been matched.
     * The `matchmake` endpoint stores a `user_matched_<userId>` cache entry when
     * a match is found, so the other player can discover it by polling this endpoint.
     */
    #[OA\Get(path: "/multiplayer/match-status", summary: "Poll for match status (WebSocket fallback)", tags: ["Multiplayer"])]
    #[OA\Response(response: 200, description: "Poll response for matchmaking queue status")]
    public function matchStatus(Request $request)
    {
        $user = $request->user();
        $matchedData = \Illuminate\Support\Facades\Cache::get('user_matched_' . $user->id);

        if ($matchedData) {
            // Consume the notification so it's only delivered once
            \Illuminate\Support\Facades\Cache::forget('user_matched_' . $user->id);
            return $this->successResponse([
                'status'    => 'matched',
                'match_id'  => $matchedData['match_id'],
                'opponent'  => $matchedData['opponent'],
            ]);
        }

        // Check if the user is still in the queue
        $queueKey  = \Illuminate\Support\Facades\Cache::get('user_matchmake_key_' . $user->id);
        $inQueue   = $queueKey && \Illuminate\Support\Facades\Cache::has($queueKey);

        return $this->successResponse([
            'status' => $inQueue ? 'queued' : 'idle',
        ]);
    }

    #[OA\Get(path: "/multiplayer/debug/match/{matchId}", summary: "Debug match payload", tags: ["Multiplayer"])]
    #[OA\Response(response: 200, description: "Debug match payload info")]
    public function debugMatch($matchId)
    {
        $match = GameMatch::find($matchId);
        return $this->successResponse($match);
    }
}