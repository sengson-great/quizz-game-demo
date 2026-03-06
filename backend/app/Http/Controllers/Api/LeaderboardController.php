<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GameSession;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class LeaderboardController extends Controller
{
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