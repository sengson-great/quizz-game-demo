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

// Public leaderboard
Route::get('/leaderboard', [LeaderboardController::class, 'index']);

// ─── Authenticated Routes ─────────────────────────────────────
Route::middleware('auth:api')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

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

        // Score polling fallback
        Route::get('/scores/{matchId}', [MultiplayerController::class, 'getScores']);
        
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