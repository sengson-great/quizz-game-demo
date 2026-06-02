<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Question;
use App\Models\Answer;
use App\Models\GameSession;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GameFlowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->user = User::factory()->create();
        
        // Create a few questions
        $this->questions = Question::factory()
            ->count(5)
            ->has(Answer::factory()->count(4))
            ->create(['difficulty_level' => 'easy']);
            
        // Ensure one answer is correct for each
        foreach ($this->questions as $q) {
            $q->answers()->first()->update(['is_correct' => true]);
        }
    }

    public function test_user_can_start_game_session()
    {
        $this->actingAs($this->user, 'api');

        $response = $this->postJson('/api/games');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'session' => ['id', 'current_level', 'status'],
                'question'
            ]);
            
        $this->assertDatabaseHas('game_sessions', [
            'user_id' => $this->user->id,
            'status' => 'active'
        ]);
    }

    public function test_user_can_submit_correct_answer()
    {
        $this->actingAs($this->user, 'api');
        
        $session = GameSession::create([
            'user_id' => $this->user->id,
            'status' => 'active',
            'current_level' => 1
        ]);
        
        $question = $this->questions->first();
        $correctAnswer = $question->answers()->where('is_correct', true)->first();

        $response = $this->postJson("/api/games/{$session->id}/answer", [
            'answer_id' => $correctAnswer->id
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('status', 'correct');
            
        $this->assertEquals(2, $session->fresh()->current_level);
    }

    public function test_user_continues_on_wrong_answer()
    {
        $this->actingAs($this->user, 'api');
        
        $session = GameSession::create([
            'user_id' => $this->user->id,
            'status' => 'active',
            'current_level' => 1
        ]);
        
        $question = $this->questions->first();
        $wrongAnswer = $question->answers()->where('is_correct', false)->first();

        $response = $this->postJson("/api/games/{$session->id}/answer", [
            'answer_id' => $wrongAnswer->id
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('status', 'wrong');
            
        $this->assertEquals('active', $session->fresh()->status);
        $this->assertEquals(2, $session->fresh()->current_level);
    }

    public function test_user_can_use_skip_lifeline_and_gets_new_question()
    {
        $this->actingAs($this->user, 'api');
        
        $session = GameSession::create([
            'user_id' => $this->user->id,
            'status' => 'active',
            'current_level' => 1,
            'lifelines' => [
                'fiftyFifty'   => true,
                'skip'         => true,
                'doubleChance' => true,
                'audienceVote' => true,
                'phoneFriend'  => true
            ]
        ]);
        
        // Load the first question to cache it
        $response1 = $this->getJson("/api/games/{$session->id}");
        $response1->assertStatus(200);
        $firstQuestionId = $response1->json('question.id');
        $this->assertNotNull($firstQuestionId);

        // Verify that calling show again returns the same cached question
        $response2 = $this->getJson("/api/games/{$session->id}");
        $this->assertEquals($firstQuestionId, $response2->json('question.id'));

        // Use the skip lifeline
        $responseSkip = $this->postJson("/api/games/{$session->id}/lifeline", [
            'type' => 'skip',
            'question_id' => $firstQuestionId
        ]);

        $responseSkip->assertStatus(200)
            ->assertJsonPath('status', 'ok');

        $nextQuestionId = $responseSkip->json('next_question.id');
        
        // Assert that the next question is different from the skipped one
        $this->assertNotNull($nextQuestionId);
        $this->assertNotEquals($firstQuestionId, $nextQuestionId);

        // Verify that the database recorded the skip
        $this->assertDatabaseHas('game_session_questions', [
            'game_session_id' => $session->id,
            'question_id' => $firstQuestionId,
            'is_correct' => null
        ]);

        // Verify that the skip lifeline is now marked as used (false)
        $this->assertFalse($session->fresh()->lifelines['skip']);
    }

    public function test_user_can_complete_full_15_level_game()
    {
        $this->actingAs($this->user, 'api');

        // Create enough questions for a full game: 10 easy, 10 medium, 10 hard
        Question::factory()
            ->count(5)
            ->has(Answer::factory()->count(4))
            ->create(['difficulty_level' => 'easy']);
        
        Question::factory()
            ->count(10)
            ->has(Answer::factory()->count(4))
            ->create(['difficulty_level' => 'medium']);

        Question::factory()
            ->count(10)
            ->has(Answer::factory()->count(4))
            ->create(['difficulty_level' => 'hard']);

        // Set one correct answer for all questions
        foreach (Question::all() as $q) {
            if ($q->answers()->where('is_correct', true)->count() === 0) {
                $q->answers()->first()->update(['is_correct' => true]);
            }
        }

        // Start session
        $response = $this->postJson('/api/games');
        $response->assertStatus(200);
        $session = GameSession::latest()->first();

        for ($level = 1; $level <= 15; $level++) {
            $this->assertEquals($level, $session->current_level);
            
            // Get current question
            $responseShow = $this->getJson("/api/games/{$session->id}");
            $responseShow->assertStatus(200);
            $question = $responseShow->json('question');
            $this->assertNotNull($question, "Question should not be null at level {$level}");

            // Find correct answer
            $dbQuestion = Question::find($question['id']);
            $correctAns = $dbQuestion->answers()->where('is_correct', true)->first();

            // Submit answer
            $responseAns = $this->postJson("/api/games/{$session->id}/answer", [
                'answer_id' => $correctAns->id
            ]);
            $responseAns->assertStatus(200);

            $session = $session->fresh();

            if ($level < 15) {
                $responseAns->assertJsonPath('status', 'correct');
                $this->assertNotNull($responseAns->json('next_question'), "Next question should not be null at level {$level}");
            } else {
                $responseAns->assertJsonPath('status', 'correct');
                $this->assertEquals('completed', $session->status);
                $this->assertNull($responseAns->json('next_question'));
            }
        }
    }

    public function test_opponent_surrender_completes_game_for_remaining_player()
    {
        $player = User::factory()->create();
        $opponent = User::factory()->create();
        
        $match = \App\Models\GameMatch::create([
            'id' => (string) \Illuminate\Support\Str::uuid(),
            'mode' => '1v1',
            'players' => [
                ['id' => $player->id, 'name' => $player->name, 'avatar' => $player->avatar],
                ['id' => $opponent->id, 'name' => $opponent->name, 'avatar' => $opponent->avatar]
            ],
            'questions' => ['1' => $this->questions->first()->id],
            'status' => 'active'
        ]);

        $playerSession = GameSession::create([
            'user_id' => $player->id,
            'match_id' => $match->id,
            'status' => 'active',
            'current_level' => 1,
            'score' => 1000
        ]);

        $opponentSession = GameSession::create([
            'user_id' => $opponent->id,
            'match_id' => $match->id,
            'status' => 'active',
            'current_level' => 1,
            'score' => 1500
        ]);

        $this->actingAs($opponent, 'api');

        // Opponent leaves (surrenders)
        $response = $this->postJson('/api/multiplayer/action', [
            'match_id' => $match->id,
            'action_type' => 'player_left',
            'payload' => ['left' => true]
        ]);

        $response->assertStatus(200);

        // Opponent's session should be failed with 2000 points penalty (min 0)
        $this->assertEquals('failed', $opponentSession->fresh()->status);
        $this->assertEquals(0, $opponentSession->fresh()->score); // 1500 - 2000 capped at 0

        // Remaining player's session should be set to completed
        $this->assertEquals('completed', $playerSession->fresh()->status);
    }
}

