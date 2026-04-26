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

        $response->assertStatus(201)
            ->assertJsonStructure([
                'id', 'current_level', 'status', 'next_question'
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

    public function test_user_fails_on_wrong_answer()
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
            
        $this->assertEquals('failed', $session->fresh()->status);
    }
}
