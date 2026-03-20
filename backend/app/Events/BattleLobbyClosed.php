<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class BattleLobbyClosed implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $userId;
    public $battleId;

    public function __construct($userId, $battleId)
    {
        $this->userId = $userId;
        $this->battleId = $battleId;
    }

    public function broadcastOn()
    {
        return [new PrivateChannel('user.' . $this->userId)];
    }

    public function broadcastAs()
    {
        return 'battle.lobby.closed';
    }

    public function broadcastWith()
    {
        return [
            'battle_id' => $this->battleId,
            'message' => 'The battle lobby has been closed'
        ];
    }
}