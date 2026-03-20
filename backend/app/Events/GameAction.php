<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class GameAction implements \Illuminate\Contracts\Broadcasting\ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $matchId;
    public $user_id;
    public $action;
    public $data;

    /**
     * Create a new event instance.
     */
    public function __construct($matchId, $userId, $action, $data = [])
    {
        $this->matchId = $matchId;
        $this->user_id = $userId;
        $this->action = $action;
        $this->data = $data;
    }

    public function broadcastOn()
    {
        return [
            new PrivateChannel('match.' . $this->matchId),
        ];
    }

    public function broadcastAs(): string
    {
        return 'game.action';
    }
}
