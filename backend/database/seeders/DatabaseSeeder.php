<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Category;
use App\Models\Question;
use App\Models\Answer;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash; // Import Hash here

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Admin user
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'role' => 'admin',
            'password' => Hash::make('password'),
        ]);

        // Player user
        User::create([
            'name' => 'Player One',
            'email' => 'player@example.com',
            'role' => 'player',
            'password' => Hash::make('password'),
        ]);

        $categories = ['General Knowledge', 'Science', 'History', 'Pop Culture'];
        $catIds = [];
        foreach ($categories as $cat) {
            $c = Category::create(['name' => $cat, 'description' => 'Test category']);
            $catIds[] = $c->id;
        }

        // Create questions for levels 1-15
        for ($level = 1; $level <= 15; $level++) {
            // Create 3 variations per level
            for ($var = 1; $var <= 3; $var++) {
                $qText = "Level $level Question $var: What is $level + $var?";
                $correct = $level + $var;

                $question = Question::create([
                    'category_id' => $catIds[array_rand($catIds)],
                    'text' => $qText,
                    'difficulty_level' => $level,
                ]);

                // Create 4 answers
                // 1 correct
                Answer::create(['question_id' => $question->id, 'text' => (string) $correct, 'is_correct' => true]);

                // 3 Wrong
                for ($i = 1; $i <= 3; $i++) {
                    Answer::create(['question_id' => $question->id, 'text' => (string) ($correct + $i), 'is_correct' => false]);
                }
            }
        }
    }
}
