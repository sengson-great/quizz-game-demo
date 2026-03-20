<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\GameController;
use App\Http\Controllers\Api\MultiplayerController;
use App\Models\Question;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/battle/invite/{inviteCode}', function ($inviteCode) {
    return response()->json([
        'invite_code' => $inviteCode,
        'message' => 'Use this code in the app to join the battle',
        'join_url' => url("/api/multiplayer/battle/join/{$inviteCode}")
    ]);
});


Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::get('/players/search', [AuthController::class, 'searchPlayers']);

    // Game Routes
    Route::post('/games', [GameController::class, 'store']);
    Route::get('/games/{session}', [GameController::class, 'show']);
    Route::post('/games/{session}/answer', [GameController::class, 'answer']);
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

    // Admin Routes
    Route::middleware('can:admin')->group(function () {
        // Simple admin endpoint
        Route::get('/admin/questions', function () {
            return Question::with('category')->paginate(50);
        });
        Route::post('/admin/questions', function (Request $request) {
            // Logic to create question
            return Question::create($request->all());
        });
    });
});