<?php

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class CategoryFactory extends Factory
{
    protected $model = Category::class;

    public function definition(): array
    {
        $name = $this->faker->unique()->word();
        return [
            'name' => $name,
            'slug' => Str::slug($name) . '-' . $this->faker->unique()->numberBetween(1, 1000),
            'name_km' => $name . ' ខ្មែរ',
            'icon' => 'default-icon',
            'color' => $this->faker->safeHexColor(),
            'description' => $this->faker->sentence(),
            'is_enabled' => true,
        ];
    }
}
