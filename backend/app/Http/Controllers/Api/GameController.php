<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GameSession;
use App\Models\Question;
use App\Services\GameService;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class GameController extends Controller
{
    private $gameService;

    public function __construct(GameService $gameService)
    {
        $this->gameService = $gameService;
    }

    #[OA\Post(path: "/games", summary: "Start a new game session", tags: ["Game"])]
    #[OA\Response(response: 200, description: "Returns the newly created game session and first question")]
    public function store(Request $request)
    {
        $session = $this->gameService->createSession(
            $request->user(), 
            $request->input('match_id')
        );
        return response()->json([
            'session' => $session,
            'question' => $this->gameService->getNextQuestion($session)
        ]);
    }

    #[OA\Get(path: "/games/{session}", summary: "Get an active game session state", tags: ["Game"])]
    #[OA\Parameter(name: "session", in: "path", required: true, description: "Game Session ID")]
    #[OA\Response(response: 200, description: "Session and current question details")]
    #[OA\Response(response: 403, description: "Forbidden/Not owner of session")]
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

    #[OA\Post(path: "/games/{session}/answer", summary: "Submit an answer for the current question", tags: ["Game"])]
    #[OA\Parameter(name: "session", in: "path", required: true, description: "Game Session ID")]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ["answer_id"],
            properties: [new OA\Property(property: "answer_id", type: "integer", example: 123)]
        )
    )]
    #[OA\Response(response: 200, description: "Answer evaluation result (correct/wrong) and optional next question")]
    #[OA\Response(response: 400, description: "Game already ended")]
    #[OA\Response(response: 403, description: "Forbidden")]
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
    #[OA\Post(path: "/games/{session}/lifeline", summary: "Use a lifeline for the current question", tags: ["Game"])]
    #[OA\Parameter(name: "session", in: "path", required: true, description: "Game Session ID")]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ["type"],
            properties: [
                new OA\Property(property: "type", type: "string", description: "Name of lifeline (e.g. fiftyFifty, skip, audienceVote, phoneFriend)", example: "fiftyFifty"),
                new OA\Property(property: "question_id", type: "integer", description: "ID of the question (for lifelines that need it)", example: 45)
            ]
        )
    )]
    #[OA\Response(response: 200, description: "Result of using the lifeline (e.g. hidden answers or next question)")]
    #[OA\Response(response: 403, description: "Forbidden")]
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
