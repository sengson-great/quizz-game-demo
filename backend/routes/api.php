<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\GameController;
use App\Models\Question;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Game Routes
    Route::post('/games', [GameController::class, 'store']);
    Route::get('/games/{session}', [GameController::class, 'show']);
    Route::post('/games/{session}/answer', [GameController::class, 'answer']);
    Route::post('/games/{session}/lifeline', [GameController::class, 'lifeline']);

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
