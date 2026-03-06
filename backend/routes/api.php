<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\GameController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\QuestionController;
use App\Http\Controllers\Api\GameSettingController;
use App\Http\Controllers\Api\LeaderboardController;

// ─── Public Routes ───────────────────────────────────────────
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

// Public leaderboard
Route::get('/leaderboard', [LeaderboardController::class, 'index']);

// ─── Authenticated Routes ─────────────────────────────────────
Route::middleware('auth:api')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user',    [AuthController::class, 'user']);

    // Game routes
    Route::post('/games',                    [GameController::class, 'store']);
    Route::get('/games/{session}',           [GameController::class, 'show']);
    Route::post('/games/{session}/answer',   [GameController::class, 'answer']);
    Route::post('/games/{session}/lifeline', [GameController::class, 'lifeline']);

    // ─── Admin Routes ─────────────────────────────────────────
    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::get('/stats',                            [LeaderboardController::class, 'stats']);
        Route::apiResource('categories',                CategoryController::class);
        Route::apiResource('questions',                 QuestionController::class);
        Route::get('/settings',                         [GameSettingController::class, 'index']);
        Route::put('/settings',                         [GameSettingController::class, 'update']);
    });
});
