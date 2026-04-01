<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class QuestionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $json = file_get_contents(database_path('data/questions.json'));
        $data = json_decode($json, true);

        if (!$data) {
            $this->command->error('Failed to decode questions.json');
            return;
        }

        // Truncate existing data to avoid duplicates (optional but recommended for clean seed)
        \Illuminate\Support\Facades\Schema::disableForeignKeyConstraints();
        \App\Models\Answer::truncate();
        \App\Models\Question::truncate();
        \App\Models\Category::truncate();
        \Illuminate\Support\Facades\Schema::enableForeignKeyConstraints();

        $categoryMap = [];

        foreach ($data['categories'] as $cat) {
            $category = \App\Models\Category::create([
                'slug' => $cat['id'],
                'name' => $cat['name'],
                'name_km' => $cat['name_km'] ?? null,
                'icon' => $cat['icon'],
                'color' => $cat['color'],
                'description' => $cat['description'] ?? null,
            ]);
            $categoryMap[$cat['id']] = $category->id;
        }

        foreach ($data['questions'] as $q) {
            $difficulty = strtolower($q['difficulty']);
            
            $question = \App\Models\Question::create([
                'category_id' => $categoryMap[$q['categoryId']] ?? null,
                'text' => $q['text'],
                'text_km' => $q['text_km'] ?? null,
                'explanation' => $q['explanation'] ?? null,
                'explanation_km' => $q['explanation_km'] ?? null,
                'difficulty_level' => $difficulty,
            ]);

            if (!$question->category_id) {
                $this->command->warn("Question '{$q['id']}' has unknown category '{$q['categoryId']}'");
            }

            foreach ($q['answers'] as $ans) {
                \App\Models\Answer::create([
                    'question_id' => $question->id,
                    'text' => $ans['text'],
                    'text_km' => $ans['text_km'] ?? null,
                    'is_correct' => $ans['isCorrect'],
                ]);
            }
        }

        $this->command->info('Seeded ' . count($data['categories']) . ' categories and ' . count($data['questions']) . ' questions.');
    }
}
