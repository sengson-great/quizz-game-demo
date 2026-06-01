<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Question;
use Illuminate\Database\Eloquent\Factories\Factory;

class QuestionFactory extends Factory
{
    protected $model = Question::class;

    public function definition(): array
    {
        return [
            'category_id' => Category::factory(),
            'text' => $this->faker->sentence() . '?',
            'text_km' => $this->faker->sentence() . '?',
            'explanation' => $this->faker->sentence(),
            'explanation_km' => $this->faker->sentence(),
            'difficulty_level' => $this->faker->randomElement(['easy', 'medium', 'hard']),
        ];
    }
}
