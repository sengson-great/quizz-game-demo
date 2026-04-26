<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreQuestionRequest;
use App\Http\Resources\QuestionResource;
use App\Models\Question;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use OpenApi\Attributes as OA;

class QuestionController extends Controller
{
    #[OA\Get(path: "/admin/questions", summary: "List all questions", tags: ["Admin: Questions"])]
    #[OA\Parameter(name: "difficulty_level", in: "query", required: false, description: "Filter by difficulty (easy, medium, hard)", example: "easy")]
    #[OA\Parameter(name: "category_id", in: "query", required: false, description: "Filter by category ID", example: 1)]
    #[OA\Response(response: 200, description: "A paginated list of questions")]
    public function index(Request $request)
    {
        $query = Question::with(['answers', 'category']);
        if ($request->difficulty_level) $query->where('difficulty_level', $request->difficulty_level);
        if ($request->category_id) $query->where('category_id', $request->category_id);

        $limit = (int) $request->get('limit', 20);
        
        $questions = ($limit >= 1000) ? $query->get() : $query->paginate($limit);
        
        return QuestionResource::collection($questions);
    }

    #[OA\Post(path: "/admin/questions", summary: "Create a new question", tags: ["Admin: Questions"])]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ["text", "difficulty_level", "answers"],
            properties: [
                new OA\Property(property: "text", type: "string", example: "What is the capital of France?"),
                new OA\Property(property: "difficulty_level", type: "string", example: "easy"),
                new OA\Property(property: "category_id", type: "integer", example: 1),
                new OA\Property(
                    property: "answers",
                    type: "array",
                    items: new OA\Items(
                        properties: [
                            new OA\Property(property: "text", type: "string", example: "Paris"),
                            new OA\Property(property: "is_correct", type: "boolean", example: true)
                        ]
                    )
                )
            ]
        )
    )]
    #[OA\Response(response: 201, description: "Question created")]
    #[OA\Response(response: 422, description: "Validation error")]
    public function store(StoreQuestionRequest $request)
    {
        return DB::transaction(function () use ($request) {
            $question = Question::create($request->validated());
            
            foreach ($request->answers as $answer) {
                $question->answers()->create($answer);
            }
            
            return new QuestionResource($question->load('answers'));
        });
    }

    #[OA\Get(path: "/admin/questions/{question}", summary: "Get a specific question", tags: ["Admin: Questions"])]
    #[OA\Parameter(name: "question", in: "path", required: true, description: "Question ID", example: 1)]
    #[OA\Response(response: 200, description: "Question details including answers")]
    #[OA\Response(response: 404, description: "Question not found")]
    public function show($id)
    {
        $question = Question::with(['answers', 'category'])->findOrFail($id);
        return new QuestionResource($question);
    }

    #[OA\Put(path: "/admin/questions/{question}", summary: "Update an existing question", tags: ["Admin: Questions"])]
    #[OA\Parameter(name: "question", in: "path", required: true, description: "Question ID", example: 1)]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: "text", type: "string", example: "What is the capital of France?"),
                new OA\Property(property: "difficulty_level", type: "string", example: "medium"),
                new OA\Property(property: "category_id", type: "integer", example: 1),
                new OA\Property(
                    property: "answers",
                    type: "array",
                    items: new OA\Items(
                        properties: [
                            new OA\Property(property: "text", type: "string", example: "Lyon"),
                            new OA\Property(property: "is_correct", type: "boolean", example: false)
                        ]
                    )
                )
            ]
        )
    )]
    #[OA\Response(response: 200, description: "Question updated")]
    #[OA\Response(response: 404, description: "Question not found")]
    public function update(StoreQuestionRequest $request, $id)
    {
        return DB::transaction(function () use ($request, $id) {
            $question = Question::findOrFail($id);
            $question->update($request->validated());
            
            if ($request->has('answers')) {
                $question->answers()->delete();
                foreach ($request->answers as $answer) {
                    $question->answers()->create($answer);
                }
            }
            
            return new QuestionResource($question->load('answers'));
        });
    }

    #[OA\Delete(path: "/admin/questions/{question}", summary: "Delete a question", tags: ["Admin: Questions"])]
    #[OA\Parameter(name: "question", in: "path", required: true, description: "Question ID", example: 1)]
    #[OA\Response(response: 200, description: "Question deleted")]
    #[OA\Response(response: 404, description: "Question not found")]
    public function destroy($id)
    {
        $question = Question::findOrFail($id);
        
        DB::transaction(function () use ($question) {
            $question->answers()->delete();
            $question->delete();
        });
        
        return $this->successResponse(null, 'Question deleted');
    }
}