<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('game_sessions', function (Blueprint $table) {
            // Store selected category IDs (integers) as a JSON array.
            // null means "all categories" (backwards-compatible with existing sessions).
            $table->json('category_ids')->nullable()->after('match_id');
        });
    }

    public function down(): void
    {
        Schema::table('game_sessions', function (Blueprint $table) {
            $table->dropColumn('category_ids');
        });
    }
};
