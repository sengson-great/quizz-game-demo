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
        Schema::table('categories', function (Blueprint $table) {
            $table->string('slug')->nullable()->after('id');
            $table->string('icon')->nullable()->after('name');
            $table->string('color')->nullable()->after('icon');
        });

        Schema::table('questions', function (Blueprint $table) {
            $table->text('explanation')->nullable()->after('text');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->dropColumn(['slug', 'icon', 'color']);
        });

        Schema::table('questions', function (Blueprint $table) {
            $table->dropColumn('explanation');
        });
    }
};
