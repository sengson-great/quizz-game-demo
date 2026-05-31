<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Admin user
        User::forceCreate([
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
            User::forceCreate([
                'name' => $p['name'],
                'email' => $p['email'],
                'role' => 'player',
                'password' => Hash::make('password'),
            ]);
        }

        $this->call([
            QuestionSeeder::class,
        ]);
    }
}
