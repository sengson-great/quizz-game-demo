<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('questions', function (Blueprint $table) {
            $table->id();
            $table->longText('text'); // Use longText for sufficient length
            $table->enum('difficulty_level', ['easy', 'medium', 'hard']);
            $table->foreignId('category_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('answers', function (Blueprint $table) {
            $table->id();
            $table->string('text');
            $table->boolean('is_correct');
            $table->foreignId('question_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
        });

        Schema::create('game_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->integer('current_level')->default(1);
            $table->decimal('score', 15, 2)->default(0);
            $table->enum('status', ['active', 'completed', 'failed', 'timeout'])->default('active');
            $table->json('lifelines')->nullable(); // e.g. {"fifty_fifty": true, "skip": true, "double_chance": true}
            $table->timestamp('started_at')->useCurrent();
            $table->timestamp('ended_at')->nullable();
            $table->timestamps();
        });
        
        // Pivot table to track questions answered in a session
        Schema::create('game_session_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('game_session_id')->constrained()->cascadeOnDelete();
            $table->foreignId('question_id')->constrained()->cascadeOnDelete();
            $table->foreignId('answer_id')->nullable()->constrained()->onDelete('set null'); // The answer user chose
            $table->boolean('is_correct')->nullable();
            $table->integer('time_taken')->nullable(); // seconds
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('game_session_questions');
        Schema::dropIfExists('game_session_lifelines');
        Schema::dropIfExists('game_sessions');
        Schema::dropIfExists('answers');
        Schema::dropIfExists('questions');
        Schema::dropIfExists('categories');
    }
};
