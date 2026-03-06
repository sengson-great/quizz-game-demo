<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GameSetting extends Model
{
    protected $fillable = [
        'time_per_question',
        'total_levels',
        'easy_count',
        'medium_count',
        'hard_count',
    ];
}
