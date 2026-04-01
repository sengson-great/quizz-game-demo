<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->string('name_km')->nullable()->after('name');
        });
        Schema::table('questions', function (Blueprint $table) {
            $table->longText('text_km')->nullable()->after('text');
            $table->text('explanation_km')->nullable()->after('explanation');
        });
        Schema::table('answers', function (Blueprint $table) {
            $table->string('text_km')->nullable()->after('text');
        });
    }

    public function down(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->dropColumn('name_km');
        });
        Schema::table('questions', function (Blueprint $table) {
            $table->dropColumn(['text_km', 'explanation_km']);
        });
        Schema::table('answers', function (Blueprint $table) {
            $table->dropColumn('text_km');
        });
    }
};
