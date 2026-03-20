<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class BattleLobbyUpdate implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $userId;
    public $battleId;
    public $action;
    public $data;

    public function __construct($userId, $battleId, $action, $data)
    {
        $this->userId = $userId;
        $this->battleId = $battleId;
        $this->action = $action;
        $this->data = $data;
    }

    public function broadcastOn()
    {
        return [new PrivateChannel('user.' . $this->userId)];
    }

    public function broadcastAs()
    {
        return 'battle.lobby.update';
    }

    public function broadcastWith()
    {
        return [
            'battle_id' => $this->battleId,
            'action' => $this->action,
            'data' => $this->data
        ];
    }
}