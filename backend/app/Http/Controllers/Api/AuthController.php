<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use OpenApi\Attributes as OA;

class AuthController extends Controller
{
    #[OA\Post(path: "/register", summary: "Register a new user", tags: ["Authentication"])]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ["name", "email", "password", "password_confirmation"],
            properties: [
                new OA\Property(property: "name", type: "string", example: "John Doe"),
                new OA\Property(property: "email", type: "string", format: "email", example: "john@example.com"),
                new OA\Property(property: "password", type: "string", format: "password", example: "password"),
                new OA\Property(property: "password_confirmation", type: "string", format: "password", example: "password")
            ]
        )
    )]
    #[OA\Response(response: 200, description: "Successful registration")]
    #[OA\Response(response: 422, description: "Validation error")]
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'player',
        ]);

        $token = $user->createToken('Personal Access Token')->accessToken;
        return $this->successResponse(['user' => $user, 'token' => $token], 'Successful registration', 201);
    }

    #[OA\Post(path: "/login", summary: "Log in to the application", tags: ["Authentication"])]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ["email", "password"],
            properties: [
                new OA\Property(property: "email", type: "string", format: "email", example: "john@example.com"),
                new OA\Property(property: "password", type: "string", format: "password", example: "password")
            ]
        )
    )]
    #[OA\Response(response: 200, description: "Successful login")]
    #[OA\Response(response: 422, description: "Invalid credentials")]
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            throw ValidationException::withMessages([
                'email' => ['Invalid credentials.'],
            ]);
        }

        $user = Auth::user();

        $token = $user->createToken('Personal Access Token')->accessToken;
        return $this->successResponse(['user' => $user, 'token' => $token], 'Successful login');
    }

    #[OA\Post(path: "/logout", summary: "Log out the current user", tags: ["Authentication"])]
    #[OA\Response(response: 200, description: "Successfully logged out")]
    public function logout(Request $request)
    {
        // REFACTORED: Passport uses revoke() on the token
        $request->user()->token()->revoke();

        return $this->successResponse(null, 'Logged out');
    }

    #[OA\Get(path: "/user", summary: "Get current user profile", tags: ["Authentication"])]
    #[OA\Response(response: 200, description: "User profile data")]
    public function user(Request $request)
    {
        return $this->successResponse($request->user());
    }

    #[OA\Put(path: "/user", summary: "Update current user profile", tags: ["Authentication"])]
    #[OA\Response(response: 200, description: "Updated user profile")]
    public function updateUser(Request $request)
    {
        $user = $request->user();
        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'avatar' => 'nullable|string|max:255',
        ]);

        $user->update($validated);

        return $this->successResponse($user, 'Profile updated');
    }

    #[OA\Get(path: "/me/stats", summary: "Get current user's game stats and history", tags: ["Authentication"])]
    #[OA\Response(response: 200, description: "Aggregated stats and recent games")]
    public function stats(Request $request, \App\Services\StatsService $statsService)
    {
        $stats = $statsService->getUserStats($request->user());
        return $this->successResponse($stats);
    }
}