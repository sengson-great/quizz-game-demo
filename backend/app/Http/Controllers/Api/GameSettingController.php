<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GameSetting;
use Illuminate\Http\Request;

class GameSettingController extends Controller
{
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