<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GameSession;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use OpenApi\Attributes as OA;

class LeaderboardController extends Controller
{
    #[OA\Get(path: "/leaderboard", summary: "Get top players", tags: ["Leaderboard"])]
    #[OA\Response(response: 200, description: "List of top 10 players")]
    public function index()
    {
        $leaderboard = GameSession::with('user:id,name')
            ->select('user_id', DB::raw('MAX(score) as high_score'), DB::raw('COUNT(*) as games_played'))
            ->groupBy('user_id')
            ->orderByDesc('high_score')
            ->limit(10)
            ->get();
        return response()->json($leaderboard);
    }

    #[OA\Get(path: "/admin/stats", summary: "Get game statistics (Admin only)", tags: ["Leaderboard"])]
    #[OA\Response(response: 200, description: "Overall game statistics")]
    public function stats()
    {
        return response()->json([
            'total_users'  => User::count(),
            'total_games'  => GameSession::count(),
            'avg_score'    => round(GameSession::avg('score'), 2),
            'top_players'  => GameSession::with('user:id,name')
                ->select('user_id', DB::raw('MAX(score) as high_score'))
                ->groupBy('user_id')
                ->orderByDesc('high_score')
                ->limit(5)
                ->get(),
        ]);
    }
}