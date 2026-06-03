<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\GameController;
use App\Http\Controllers\Api\MultiplayerController;
use App\Http\Controllers\Api\LeaderboardController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\QuestionController;
use App\Http\Controllers\Api\GameSettingController;
use App\Models\Question;


// ─── Public Routes ───────────────────────────────────────────
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);
Route::get('/debug-deploy', function() {
    return response()->json([
        'status' => 'ok',
        'time' => date('Y-m-d H:i:s'),
        'git_commit' => @exec('git log -n 1 --oneline') ?: 'unknown',
        'app_env' => env('APP_ENV'),
        'cache_driver' => env('CACHE_STORE', env('CACHE_DRIVER')),
    ]);
});

// Explicitly register broadcast routes for API/Passport
\Illuminate\Support\Facades\Broadcast::routes(['middleware' => ['auth:api']]);


// Public leaderboard
Route::get('/leaderboard', [LeaderboardController::class, 'index']);
Route::get('/categories', [CategoryController::class, 'index']);

// ─── Authenticated Routes ─────────────────────────────────────
Route::middleware('auth:api')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::put('/user', [AuthController::class, 'updateUser']);
    Route::get('/me/stats', [AuthController::class, 'stats']);

    // Game routes
    Route::post('/games',                    [GameController::class, 'store']);
    Route::get('/games/{session}',           [GameController::class, 'show']);
    Route::post('/games/{session}/answer',   [GameController::class, 'answer']);
    Route::post('/games/{session}/lifeline', [GameController::class, 'lifeline']);

    // Multiplayer Routes
    Route::prefix('multiplayer')->group(function () {
        // 1v1 Matchmaking
        Route::post('/matchmake', [MultiplayerController::class, 'matchmake']);
        Route::post('/cancel-matchmake', [MultiplayerController::class, 'cancelMatchmake']);
        Route::post('/action', [MultiplayerController::class, 'sendAction']);
        
        // Battle Lobby Routes (Private/Invite-only battles)
        Route::post('/battle/create', [MultiplayerController::class, 'createBattle']);
        Route::post('/battle/join/{inviteCode}', [MultiplayerController::class, 'joinBattle']);
        Route::get('/battle/lobby/{inviteCode}', [MultiplayerController::class, 'getBattleLobby']);
        Route::post('/battle/ready/{inviteCode}', [MultiplayerController::class, 'setReady']);
        Route::post('/battle/start/{inviteCode}', [MultiplayerController::class, 'startBattle']);
        Route::post('/battle/leave/{inviteCode}', [MultiplayerController::class, 'leaveBattle']);
        Route::post('/battle/ping/{inviteCode}', [MultiplayerController::class, 'pingLobby']);

        // Score polling fallback
        Route::get('/scores/{matchId}', [MultiplayerController::class, 'getScores']);

        // Match status polling fallback (for WebSocket-less environments)
        Route::get('/match-status', [MultiplayerController::class, 'matchStatus']);
        
        // Debug
        Route::get('/debug/match/{matchId}', [MultiplayerController::class, 'debugMatch']);
    });

    // ─── Admin Routes ─────────────────────────────────────────
    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::get('/stats',                            [LeaderboardController::class, 'stats']);
        Route::apiResource('categories',                CategoryController::class);
        Route::apiResource('questions',                 QuestionController::class);
        Route::get('/settings',                         [GameSettingController::class, 'index']);
        Route::put('/settings',                         [GameSettingController::class, 'update']);
    });
});