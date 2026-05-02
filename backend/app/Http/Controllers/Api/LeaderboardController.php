<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GameSession;
use App\Models\User;
use App\Models\Category;
use App\Models\GameSessionQuestion;
use Carbon\Carbon;
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
        // 1. Most Failed Questions
        $mostFailed = GameSessionQuestion::with('question:id,text,text_km')
            ->where('is_correct', false)
            ->select('question_id', DB::raw('count(*) as fails'))
            ->groupBy('question_id')
            ->orderByDesc('fails')
            ->limit(5)
            ->get()
            ->map(function ($q) {
                $totalAttempts = GameSessionQuestion::where('question_id', $q->question_id)->count();
                return [
                    'question' => $q->question->text ?? 'Unknown',
                    'question_km' => $q->question->text_km ?? null,
                    'fails'    => $q->fails,
                    'failRate' => round(($q->fails / max($totalAttempts, 1)) * 100, 1)
                ];
            });

        // 2. Category Performance (Average Score)
        $allSessions = GameSession::all();
        $categoryScores = Category::all()->map(function ($cat) use ($allSessions) {
            $matching = $allSessions->filter(function ($s) use ($cat) {
                if (is_null($s->category_ids)) return true;
                return in_array((int)$cat->id, array_map('intval', (array)$s->category_ids));
            });

            return [
                'category' => $cat->name,
                'category_km' => $cat->name_km,
                'avgScore' => (int)($matching->avg('score') ?? 0)
            ];
        })->sortByDesc('avgScore')->values();

        // 3. Daily Activity (Last 14 days)
        $dailyActivity = [];
        for ($i = 13; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);
            $dateStr = $date->toDateString();
            $label = $date->format('d M');

            $usersCount = GameSession::whereDate('created_at', $dateStr)->distinct('user_id')->count('user_id');
            $gamesCount = GameSession::whereDate('created_at', $dateStr)->count();

            $dailyActivity[] = [
                'day'   => $label,
                'users' => $usersCount,
                'games' => $gamesCount
            ];
        }

        // 4. Game Mode Distribution
        $soloCount = GameSession::whereNull('match_id')->count();
        $multiCount = GameSession::whereNotNull('match_id')->count();

        return response()->json([
            'total_users'  => User::count(),
            'total_games'  => GameSession::count(),
            'avg_score'    => (int) round(GameSession::avg('score') ?? 0),
            'most_failed_questions' => $mostFailed,
            'category_scores'       => $categoryScores,
            'daily_activity'        => $dailyActivity,
            'game_mode_distribution' => [
                ['name' => 'soloMode', 'value' => $soloCount],
                ['name' => 'multiplayer', 'value' => $multiCount],
            ],
            'top_players'  => GameSession::with('user:id,name,avatar')
                ->select('user_id', DB::raw('MAX(score) as high_score'))
                ->groupBy('user_id')
                ->orderByDesc('high_score')
                ->limit(5)
                ->get(),
        ]);
    }
}