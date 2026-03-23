<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Question;
use Illuminate\Http\Request;
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
        return response()->json($query->paginate(20));
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
    public function store(Request $request)
    {
        $request->validate([
            'text'             => 'required|string',
            'difficulty_level' => 'required|in:easy,medium,hard',
            'category_id'      => 'nullable|exists:categories,id',
            'answers'          => 'required|array|min:2',
            'answers.*.text'       => 'required|string',
            'answers.*.is_correct' => 'required|boolean',
        ]);
        $question = Question::create($request->only('text', 'difficulty_level', 'category_id'));
        foreach ($request->answers as $answer) {
            $question->answers()->create($answer);
        }
        return response()->json($question->load('answers'), 201);
    }

    #[OA\Get(path: "/admin/questions/{question}", summary: "Get a specific question", tags: ["Admin: Questions"])]
    #[OA\Parameter(name: "question", in: "path", required: true, description: "Question ID", example: 1)]
    #[OA\Response(response: 200, description: "Question details including answers")]
    #[OA\Response(response: 404, description: "Question not found")]
    public function show($id)
    {
        return response()->json(Question::with(['answers', 'category'])->findOrFail($id));
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
    public function update(Request $request, $id)
    {
        $question = Question::findOrFail($id);
        $question->update($request->only('text', 'difficulty_level', 'category_id'));
        if ($request->has('answers')) {
            $question->answers()->delete();
            foreach ($request->answers as $answer) {
                $question->answers()->create($answer);
            }
        }
        return response()->json($question->load('answers'));
    }

    #[OA\Delete(path: "/admin/questions/{question}", summary: "Delete a question", tags: ["Admin: Questions"])]
    #[OA\Parameter(name: "question", in: "path", required: true, description: "Question ID", example: 1)]
    #[OA\Response(response: 200, description: "Question deleted")]
    #[OA\Response(response: 404, description: "Question not found")]
    public function destroy($id)
    {
        $question = Question::findOrFail($id);
        $question->answers()->delete();
        $question->delete();
        return response()->json(['message' => 'Question deleted']);
    }
}