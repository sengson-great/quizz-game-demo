<?php

namespace App\Policies;

use App\Models\GameSession;
use App\Models\User;

class GameSessionPolicy
{
    /**
     * Determine if the user can view the game session.
     */
    public function view(User $user, GameSession $session): bool
    {
        return $user->id === $session->user_id;
    }

    /**
     * Determine if the user can update the game session (e.g. submit answers/lifelines).
     */
    public function update(User $user, GameSession $session): bool
    {
        return $user->id === $session->user_id;
    }
}
