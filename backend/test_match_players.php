<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Services\GameService;
use App\Models\User;
use App\Models\GameMatch;
use Illuminate\Support\Str;

echo "--- Simulating Player A and Player B joining a match ---\n";

$users = User::take(2)->get();
$playerA = $users[0];
$playerB = $users[1];

echo "Player A: {$playerA->name}\n";
echo "Player B: {$playerB->name}\n";

// 1. Create Match
$matchId = (string) Str::uuid();

function generateQuestions() {
    $questions = [];
    for ($level = 1; $level <= 15; $level++) {
        $question = \App\Models\Question::where('difficulty_level', $level)->inRandomOrder()->first();
        if ($question) $questions[$level] = $question->id;
    }
    return $questions;
}

$match = GameMatch::create([
    'id' => $matchId,
    'mode' => '1v1',
    'players' => [
        ['id' => $playerA->id, 'name' => $playerA->name],
        ['id' => $playerB->id, 'name' => $playerB->name]
    ],
    'questions' => generateQuestions(),
    'status' => 'active'
]);

echo "Created Match UUID: {$match->id}\n";
echo "Match Questions: " . json_encode($match->questions) . "\n";

// 2. Player A starts session
$gameService = new GameService();
try {
    $sessionA = $gameService->createSession($playerA, $matchId);
    echo "Player A Session created. Session ID: {$sessionA->id}, Match ID: {$sessionA->match_id}\n";
    
    $questionA = $gameService->getNextQuestion($sessionA);
    echo "Player A Question 1: ID={$questionA->id}, Text='{$questionA->text}'\n";
} catch (\Exception $e) {
    echo "Player A ERROR: " . $e->getMessage() . "\n";
}

// 3. Player B starts session
try {
    $sessionB = $gameService->createSession($playerB, $matchId);
    echo "Player B Session created. Session ID: {$sessionB->id}, Match ID: {$sessionB->match_id}\n";
    
    $questionB = $gameService->getNextQuestion($sessionB);
    echo "Player B Question 1: ID={$questionB->id}, Text='{$questionB->text}'\n";
} catch (\Exception $e) {
    echo "Player B ERROR: " . $e->getMessage() . "\n";
}

if (isset($questionA) && isset($questionB)) {
    if ($questionA->id === $questionB->id) {
        echo "SUCCESS: Both players received the exact same question!\n";
    } else {
        echo "FAILURE: Players received different questions!\n";
    }
}
