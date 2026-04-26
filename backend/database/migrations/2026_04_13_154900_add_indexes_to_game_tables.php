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
        Schema::table('questions', function (Blueprint $table) {
            $table->index('difficulty_level');
        });

        Schema::table('game_sessions', function (Blueprint $table) {
            $table->index('status');
            $table->index('match_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('questions', function (Blueprint $table) {
            $table->dropIndex(['difficulty_level']);
        });

        Schema::table('game_sessions', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropIndex(['match_id']);
        });
    }
};
