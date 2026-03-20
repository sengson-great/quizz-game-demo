<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Question;
use Illuminate\Http\Request;

class QuestionController extends Controller
{
    public function index(Request $request)
    {
        $query = Question::with(['answers', 'category']);
        if ($request->difficulty_level) $query->where('difficulty_level', $request->difficulty_level);
        if ($request->category_id) $query->where('category_id', $request->category_id);
        return response()->json($query->paginate(20));
    }

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

    public function show($id)
    {
        return response()->json(Question::with(['answers', 'category'])->findOrFail($id));
    }

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

    public function destroy($id)
    {
        $question = Question::findOrFail($id);
        $question->answers()->delete();
        $question->delete();
        return response()->json(['message' => 'Question deleted']);
    }
}