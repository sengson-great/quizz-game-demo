<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\User;
use App\Models\GameSession;
use App\Models\Category;
use Illuminate\Support\Facades\DB;

class StatsService
{
    /**
     * Get aggregated statistics for a specific user.
     */
    public function getUserStats(User $user): array
    {
        // Aggregate stats from game sessions
        $aggregate = GameSession::where('user_id', $user->id)
            ->selectRaw('
                COUNT(*) as games_played,
                SUM(score) as total_score,
                MAX(score) as best_score,
                SUM(CASE WHEN status = "completed" THEN 1 ELSE 0 END) as wins
            ')
            ->first();

        $gamesPlayed = (int) ($aggregate->games_played ?? 0);
        $totalScore  = (int) ($aggregate->total_score  ?? 0);
        $bestScore   = (int) ($aggregate->best_score   ?? 0);
        $wins        = (int) ($aggregate->wins         ?? 0);
        $winRate     = $gamesPlayed > 0 ? round($wins / $gamesPlayed * 100, 1) : 0;

        // Rank: how many users have a higher total_score than this user
        $rank = GameSession::selectRaw('user_id, SUM(score) as total_score')
            ->groupBy('user_id')
            ->havingRaw('SUM(score) > ?', [$totalScore])
            ->get()
            ->count() + 1;

        // Category Breakdown
        $categoryStats = Category::leftJoin('questions', 'categories.id', '=', 'questions.category_id')
            ->leftJoin('game_session_questions', function($join) use ($user) {
                $join->on('questions.id', '=', 'game_session_questions.question_id')
                     ->whereIn('game_session_questions.game_session_id', function($query) use ($user) {
                         $query->select('id')->from('game_sessions')->where('user_id', $user->id);
                     });
            })
            ->select('categories.slug', 'categories.name')
            ->selectRaw('COUNT(game_session_questions.id) as total_answered')
            ->selectRaw('SUM(CASE WHEN game_session_questions.is_correct = 1 THEN 1 ELSE 0 END) as correct_answers')
            ->groupBy('categories.id', 'categories.slug', 'categories.name')
            ->get()
            ->map(function($cat) {
                $total = (int) $cat->total_answered;
                $correct = (int) $cat->correct_answers;
                return [
                    'slug' => $cat->slug,
                    'name' => $cat->name,
                    'accuracy' => $total > 0 ? round(($correct / $total) * 100) : 0
                ];
            });

        // Recent game sessions (last 10)
        $recentGames = GameSession::where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->limit(10)
            ->get()
            ->map(fn($s) => [
                'id'         => $s->id,
                'mode'       => $s->match_id ? '1v1' : 'Solo',
                'score'      => (int) $s->score,
                'level'      => (int) $s->current_level,
                'status'     => $s->status,
                'date'       => $s->created_at?->toDateString(),
                'ended_at'   => $s->ended_at?->toDateTimeString(),
            ]);

        return [
            'stats' => [
                'total_score'  => $totalScore,
                'best_score'   => $bestScore,
                'games_played' => $gamesPlayed,
                'wins'         => $wins,
                'win_rate'     => $winRate,
                'rank'         => $rank,
            ],
            'category_stats' => $categoryStats,
            'recent_games' => $recentGames,
        ];
    }
}
