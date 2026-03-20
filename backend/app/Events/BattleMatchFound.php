<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class BattleMatchFound implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $userId;
    public $matchId;
    public $opponents;
    public $playerPosition;
    public $totalPlayers;

    /**
     * Create a new event instance.
     */
    public function __construct($userId, $matchId, $opponents, $playerPosition, $totalPlayers)
    {
        $this->userId = $userId;
        $this->matchId = $matchId;
        $this->opponents = $opponents;
        $this->playerPosition = $playerPosition;
        $this->totalPlayers = $totalPlayers;
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('user.' . $this->userId),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'ffa.match.found';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'match_id' => $this->matchId,
            'opponents' => $this->opponents,
            'player_position' => $this->playerPosition,
            'total_players' => $this->totalPlayers,
            'message' => "Battle match found with {$this->totalPlayers} players!"
        ];
    }
}