<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\GameMatch;
use App\Models\Question;
use App\Models\User;
use App\Services\GameService;
use App\Models\GameSession;
use Illuminate\Support\Str;

echo "--- Testing Question Generation ---\n";

function generateMatchQuestions()
{
    $questions = [];
    for ($level = 1; $level <= 15; $level++) {
        $question = \App\Models\Question::where('difficulty_level', $level)
            ->inRandomOrder()
            ->first();
        
        if ($question) {
            $questions[$level] = $question->id;
        }
    }
    return $questions;
}

$questions = generateMatchQuestions();
echo "Generated Questions: " . json_encode($questions) . "\n";

$matchId = (string) Str::uuid();
$match = GameMatch::create([
    'id' => $matchId,
    'mode' => '1v1',
    'players' => [],
    'questions' => $questions,
    'status' => 'active'
]);

echo "Match created with UUID: " . $match->id . "\n";
echo "Match questions attribute directly: \n";
var_dump($match->questions);

$freshMatch = GameMatch::find($matchId);
if (!$freshMatch) {
    echo "FAILED TO FIND MATCH BY UUID!\n";
} else {
    echo "Found match fresh from DB.\n";
    $freshQuestions = $freshMatch->questions;
    echo "Fresh Questions Keys type: " . gettype(array_key_first($freshQuestions)) . "\n";
    
    // Simulate GameService flow
    $session = new GameSession();
    $session->current_level = 1;
    $session->match_id = $matchId;
    
    $levelKey = (string) $session->current_level;
    echo "Lookup string key '$levelKey': " . (isset($freshQuestions[$levelKey]) ? "FOUND" : "NOT FOUND") . "\n";
    
    $levelKeyInt = $session->current_level;
    echo "Lookup int key $levelKeyInt: " . (isset($freshQuestions[$levelKeyInt]) ? "FOUND" : "NOT FOUND") . "\n";
}
