<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GameSession;
use App\Models\Question;
use App\Services\GameService; // Missing import
use Illuminate\Http\Request;

class GameController extends Controller
{
    private $gameService;

    public function __construct(GameService $gameService)
    {
        $this->gameService = $gameService;
    }

    public function store(Request $request)
    {
        $session = $this->gameService->createSession($request->user());
        return response()->json([
            'session' => $session,
            'question' => $this->gameService->getNextQuestion($session)
        ]);
    }

    public function show(GameSession $session)
    {
        // Add authorization check
        if ($session->user_id !== request()->user()->id)
            abort(403);

        return response()->json([
            'session' => $session,
            'question' => $this->gameService->getNextQuestion($session)
        ]);
    }

    public function answer(Request $request, GameSession $session)
    {
        if ($session->user_id !== request()->user()->id)
            abort(403);
        if ($session->status !== 'active')
            return response()->json(['error' => 'Game ended'], 400);

        $request->validate(['answer_id' => 'required|exists:answers,id']);

        $result = $this->gameService->processAnswer($session, $request->answer_id);

        // If correct, get next question immediately? Or separate call.
        // Frontend expects next_question in response often.
        if ($result['status'] === 'correct' && $session->status !== 'completed') {
            $result['next_question'] = $this->gameService->getNextQuestion($session);
        }

        return response()->json($result);
    }

    // Simplistic lifeline implementation
    public function lifeline(Request $request, GameSession $session)
    {
        if ($session->user_id !== request()->user()->id)
            abort(403);
        $type = $request->input('type');
        $questionId = $request->input('question_id');

        $result = $this->gameService->useLifeline($session, $type, $questionId);

        return response()->json($result);
    }
}
