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
    public function createBattle(Request $request)
    {
        $request->validate([
            'player_count' => 'required|integer|min:2|max:100',
            'is_private' => 'boolean'
        ]);

        $result = $this->service->createLobby(
            $request->user(),
            (int) $request->player_count,
            (bool) $request->get('is_private', true)
        );

        return $this->successResponse($result, 'Battle lobby created');
    }

    #[OA\Post(path: "/multiplayer/battle/join/{inviteCode}", summary: "Join a battle lobby", tags: ["Multiplayer"])]
    public function joinBattle(Request $request, $inviteCode)
    {
        try {
            $lobby = $this->service->joinLobby($request->user(), $inviteCode);
            return $this->successResponse($lobby, 'Joined successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), (int) $e->getCode() ?: 400);
        }
    }

    #[OA\Get(path: "/multiplayer/battle/lobby/{inviteCode}", summary: "Get battle lobby details", tags: ["Multiplayer"])]
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
            'is_host' => $request->user()->id === $lobby['host_id']
        ]);
    }

    #[OA\Post(path: "/multiplayer/battle/ready/{inviteCode}", summary: "Set player ready status", tags: ["Multiplayer"])]
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
    public function leaveBattle(Request $request, $inviteCode)
    {
        $this->service->leaveLobby($request->user(), $inviteCode);
        return $this->successResponse(null, 'Left successfully');
    }

    #[OA\Post(path: "/multiplayer/battle/ping/{inviteCode}", summary: "Send heartbeat to keep presence in lobby", tags: ["Multiplayer"])]
    public function pingLobby(Request $request, $inviteCode)
    {
        $this->service->pingLobby($request->user(), $inviteCode);
        return $this->successResponse(null, 'Ping received');
    }

    #[OA\Post(path: "/multiplayer/matchmake", summary: "Enter 1v1 matchmaking", tags: ["Multiplayer"])]
    public function matchmake(Request $request)
    {
        $request->validate(['mode' => 'required|in:1v1']);
        $result = $this->service->matchmake1v1($request->user());
        return $this->successResponse($result);
    }

    #[OA\Post(path: "/multiplayer/action", summary: "Send game action to other players", tags: ["Multiplayer"])]
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

        try {
            broadcast(new \App\Events\GameAction($request->match_id, $request->user()->id, $request->action_type, $payload));
            return $this->successResponse(null, 'Action sent');
        } catch (\Exception $e) {
            Log::error('GameAction broadcast failed: ' . $e->getMessage());
            return $this->errorResponse('Failed to send action', 500);
        }
    }

    #[OA\Post(path: "/multiplayer/cancel-matchmake", summary: "Cancel 1v1 matchmaking", tags: ["Multiplayer"])]
    public function cancelMatchmake(Request $request)
    {
        $user = $request->user();
        $queue = \Illuminate\Support\Facades\Cache::get('matchmaking_queue_1v1');
        if ($queue && $queue['id'] === $user->id) {
            \Illuminate\Support\Facades\Cache::forget('matchmaking_queue_1v1');
        }
        return $this->successResponse(null, 'Cancelled');
    }

    #[OA\Get(path: "/multiplayer/scores/{matchId}", summary: "Get all scores for a match", tags: ["Multiplayer"])]
    public function getScores($matchId)
    {
        $scores = \App\Models\GameSession::where('match_id', $matchId)
            ->pluck('score', 'user_id');
        return $this->successResponse($scores);
    }

    #[OA\Get(path: "/multiplayer/debug/match/{matchId}", summary: "Debug match payload", tags: ["Multiplayer"])]
    public function debugMatch($matchId)
    {
        $match = GameMatch::find($matchId);
        return $this->successResponse($match);
    }
}