<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class BattleStarted implements \Illuminate\Contracts\Broadcasting\ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $userId;
    public $matchId;
    public $opponents;
    public $playerPosition;
    public $totalPlayers;

    public function __construct($userId, $matchId, $opponents, $playerPosition, $totalPlayers)
    {
        $this->userId = $userId;
        $this->matchId = $matchId;
        $this->opponents = $opponents;
        $this->playerPosition = $playerPosition;
        $this->totalPlayers = $totalPlayers;
    }

    public function broadcastOn()
    {
        return [new PrivateChannel('user.' . $this->userId)];
    }

    public function broadcastAs()
    {
        return 'battle.started';
    }

    public function broadcastWith()
    {
        return [
            'match_id' => $this->matchId,
            'opponents' => $this->opponents,
            'player_position' => $this->playerPosition,
            'total_players' => $this->totalPlayers,
            'message' => 'Battle has started!'
        ];
    }
}