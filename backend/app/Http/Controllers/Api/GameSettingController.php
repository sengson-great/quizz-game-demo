<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GameSetting;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class GameSettingController extends Controller
{
    #[OA\Get(path: "/admin/settings", summary: "Get global game settings", tags: ["Admin: Settings"])]
    #[OA\Response(response: 200, description: "Current game settings")]
    public function index()
    {
        $settings = GameSetting::first() ?? GameSetting::create([
            'time_per_question' => 30,
            'total_levels'      => 15,
            'easy_count'        => 5,
            'medium_count'      => 5,
            'hard_count'        => 5,
        ]);
        return response()->json($settings);
    }

    #[OA\Put(path: "/admin/settings", summary: "Update global game settings", tags: ["Admin: Settings"])]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: "time_per_question", type: "integer", example: 30),
                new OA\Property(property: "total_levels", type: "integer", example: 15),
                new OA\Property(property: "easy_count", type: "integer", example: 5),
                new OA\Property(property: "medium_count", type: "integer", example: 5),
                new OA\Property(property: "hard_count", type: "integer", example: 5)
            ]
        )
    )]
    #[OA\Response(response: 200, description: "Updated game settings")]
    #[OA\Response(response: 422, description: "Validation error")]
    public function update(Request $request)
    {
        $request->validate([
            'time_per_question' => 'sometimes|integer|min:5|max:120',
            'total_levels'      => 'sometimes|integer|min:1|max:20',
            'easy_count'        => 'sometimes|integer|min:0',
            'medium_count'      => 'sometimes|integer|min:0',
            'hard_count'        => 'sometimes|integer|min:0',
        ]);
        $settings = GameSetting::first();
        if (!$settings) $settings = GameSetting::create($request->all());
        else $settings->update($request->all());
        return response()->json($settings);
    }
}