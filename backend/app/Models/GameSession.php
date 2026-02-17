<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GameSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'current_level',
        'score',
        'status',
        'lifelines',
        'started_at',
        'ended_at'
    ];

    protected $casts = [
        'lifelines' => 'array',
        'started_at' => 'datetime',
        'ended_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // History of questions in this session
    public function sessionQuestions()
    {
        return $this->hasMany(GameSessionQuestion::class);
    }
}
