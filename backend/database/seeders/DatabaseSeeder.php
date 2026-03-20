<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Category;
use App\Models\Question;
use App\Models\Answer;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

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

        // Player users
        $players = [
            ['name' => 'John Doe', 'email' => 'john@example.com'],
            ['name' => 'Jane Smith', 'email' => 'jane@example.com'],
            ['name' => 'Bob Builder', 'email' => 'bob@example.com'],
            ['name' => 'Alice Wonder', 'email' => 'alice@example.com']
        ];

        foreach ($players as $p) {
            User::create([
                'name' => $p['name'],
                'email' => $p['email'],
                'role' => 'player',
                'password' => Hash::make('password'),
            ]);
        }

        $categories = ['General Knowledge', 'Science', 'History', 'Pop Culture'];
        $catIds = [];
        foreach ($categories as $cat) {
            $c = Category::create(['name' => $cat, 'description' => 'Test category']);
            $catIds[] = $c->id;
        }

        $difficulties = ['easy', 'medium', 'hard'];

        // Create 15 questions per difficulty
        for ($level = 1; $level <= 15; $level++) {
            $difficulty = $difficulties[($level - 1) % 3];

            for ($var = 1; $var <= 3; $var++) {
                $qText = "Level $level Question $var: What is $level + $var?";
                $correct = $level + $var;

                $question = Question::create([
                    'category_id'      => $catIds[array_rand($catIds)],
                    'text'             => $qText,
                    'difficulty_level' => $difficulty,
                ]);

                Answer::create(['question_id' => $question->id, 'text' => (string) $correct, 'is_correct' => true]);

                for ($i = 1; $i <= 3; $i++) {
                    Answer::create(['question_id' => $question->id, 'text' => (string) ($correct + $i), 'is_correct' => false]);
                }
            }
        }
    }
}
