<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('game_matches', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('mode'); // 1v1, battle, etc.
            $table->json('players'); // Store all players info
            $table->integer('total_players')->default(2);
            $table->json('questions')->nullable(); // Shared question IDs for the match
            $table->string('status')->default('pending'); // pending, active, completed, abandoned
            $table->json('winner')->nullable(); // Store winner team or player info
            $table->timestamp('started_at')->nullable();
            $table->timestamp('ended_at')->nullable();
            $table->timestamps();
            
            // Indexes for faster queries
            $table->index('status');
            $table->index('mode');
            $table->index('created_at');
        });
    }

    public function down()
    {
        Schema::dropIfExists('game_matches');
    }
};