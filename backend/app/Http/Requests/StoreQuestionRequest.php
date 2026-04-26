<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\DifficultyLevel;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreQuestionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Middleware handles admin check
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'text'             => 'required|string',
            'text_km'          => 'nullable|string',
            'explanation'      => 'nullable|string',
            'explanation_km'   => 'nullable|string',
            'difficulty_level' => ['required', Rule::enum(DifficultyLevel::class)],
            'category_id'      => 'nullable|exists:categories,id',
            'answers'          => 'required|array|min:2',
            'answers.*.text'       => 'required|string',
            'answers.*.text_km'    => 'nullable|string',
            'answers.*.is_correct' => 'required|boolean',
        ];
    }
}
