<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GameSession;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use OpenApi\Attributes as OA;

class LeaderboardController extends Controller
{
    #[OA\Get(path: "/leaderboard", summary: "Get top players", tags: ["Leaderboard"])]
    #[OA\Response(response: 200, description: "List of top players")]
    public function index(Request $request)
    {
        $limit  = min((int) $request->query('limit', 50), 100);
        $sortBy = $request->query('sort', 'total_score'); // total_score | high_score | games_played | win_rate

        $allowedSorts = ['total_score', 'high_score', 'games_played', 'win_rate'];
        if (!in_array($sortBy, $allowedSorts)) {
            $sortBy = 'total_score';
        }

        $leaderboard = GameSession::with('user:id,name,avatar')
            ->select(
                'user_id',
                DB::raw('SUM(score) as total_score'),
                DB::raw('MAX(score) as high_score'),
                DB::raw('COUNT(*) as games_played'),
                DB::raw("SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as wins"),
                DB::raw("ROUND(SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) as win_rate")
            )
            ->groupBy('user_id')
            ->orderByDesc($sortBy)
            ->limit($limit)
            ->get()
            ->map(function ($entry, $index) {
                return [
                    'rank'         => $index + 1,
                    'user_id'      => $entry->user_id,
                    'name'         => $entry->user?->name ?? 'Unknown',
                    'avatar'       => $entry->user?->avatar,
                    'total_score'  => (int) $entry->total_score,
                    'high_score'   => (int) $entry->high_score,
                    'games_played' => (int) $entry->games_played,
                    'wins'         => (int) $entry->wins,
                    'win_rate'     => (float) $entry->win_rate,
                ];
            });

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
            'top_players'  => GameSession::with('user:id,name,avatar')
                ->select('user_id', DB::raw('MAX(score) as high_score'))
                ->groupBy('user_id')
                ->orderByDesc('high_score')
                ->limit(5)
                ->get(),
        ]);
    }
}