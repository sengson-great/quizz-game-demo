<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GameMatch extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'game_matches';
    
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'mode', // '1v1' or 'battle'
        'players',
        'questions',
        'status',
        'total_players',
        'winner',
        'started_at',
        'ended_at'
    ];

    protected $casts = [
        'players' => 'array',
        'questions' => 'array',
        'winner' => 'array',
        'started_at' => 'datetime',
        'ended_at' => 'datetime'
    ];

    /**
     * Check if a user is part of this match
     */
    public function hasUser($userId)
    {
        return collect($this->players)->contains('id', $userId);
    }

    /**
     * Get all players in the match
     */
    public function getAllPlayers()
    {
        return $this->players ?? [];
    }

    /**
     * Get player count
     */
    public function getPlayerCount()
    {
        return count($this->players ?? []);
    }

    /**
     * Get active players (not eliminated)
     */
    public function getActivePlayers()
    {
        return collect($this->players)->filter(function($player) {
            return !isset($player['eliminated']) || $player['eliminated'] === false;
        })->values()->all();
    }

    /**
     * Check if match is full
     */
    public function isFull()
    {
        return $this->getPlayerCount() >= $this->total_players;
    }
}