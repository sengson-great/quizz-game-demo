<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Category;
use App\Models\Question;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminQuestionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->admin = User::factory()->create(['role' => 'admin']);
        $this->category = Category::create(['name' => 'General Logic', 'slug' => 'logic']);
    }

    public function test_admin_can_create_question()
    {
        $this->actingAs($this->admin, 'api');

        $response = $this->postJson('/api/admin/questions', [
            'text' => 'What is 2+2?',
            'difficulty_level' => 'easy',
            'category_id' => $this->category->id,
            'answers' => [
                ['text' => '3', 'is_correct' => false],
                ['text' => '4', 'is_correct' => true],
            ]
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.text', 'What is 2+2?');
            
        $this->assertDatabaseHas('questions', ['text' => 'What is 2+2?']);
        $this->assertDatabaseCount('answers', 2);
    }

    public function test_non_admin_cannot_create_question()
    {
        $player = User::factory()->create(['role' => 'player']);
        $this->actingAs($player, 'api');

        $response = $this->postJson('/api/admin/questions', [
            'text' => 'Forbidden?',
            'difficulty_level' => 'easy',
            'answers' => [
                ['text' => 'Yes', 'is_correct' => true],
                ['text' => 'No', 'is_correct' => false],
            ]
        ]);

        $response->assertStatus(403);
    }

    public function test_admin_can_delete_question()
    {
        $question = Question::factory()->create();
        $this->actingAs($this->admin, 'api');

        $response = $this->deleteJson("/api/admin/questions/{$question->id}");

        $response->assertStatus(200);
        $this->assertSoftDeleted('questions', ['id' => $question->id]);
    }
}
