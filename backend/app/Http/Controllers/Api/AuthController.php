<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Auth\Events\PasswordReset;
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

        try {
            $request->validate([
                'email' => 'required|email',
                'password' => 'required',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            throw $e;
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !\Illuminate\Support\Facades\Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Invalid credentials.'],
            ]);
        }

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

    #[OA\Post(path: "/forgot-password", summary: "Send password reset link", tags: ["Authentication"])]
    #[OA\Response(response: 200, description: "Password reset link sent successfully")]
    #[OA\Response(response: 422, description: "Validation error")]
    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        try {
            $status = Password::sendResetLink(
                $request->only('email')
            );
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Password reset mail sending failed: ' . $e->getMessage());

            $user = User::where('email', $request->email)->first();
            if ($user) {
                $token = Password::getRepository()->create($user);
                $resetUrl = config('app.frontend_url').'/password-reset?token='.$token.'&email='.$user->email;
                \Illuminate\Support\Facades\Log::info("Manual reset URL created due to mail failure: {$resetUrl}");

                $responseData = ['message' => 'We have emailed your password reset link! (Logged locally)'];
                if (config('app.debug')) {
                    $responseData['reset_url'] = $resetUrl;
                    $responseData['error_debug'] = $e->getMessage();
                }

                return $this->successResponse($responseData, 'We have emailed your password reset link!');
            }

            throw ValidationException::withMessages(['email' => ['We could not find a user with that email address.']]);
        }

        return $status === Password::RESET_LINK_SENT
            ? $this->successResponse(['message' => __($status)], __($status))
            : throw ValidationException::withMessages(['email' => [__($status)]]);
    }

    #[OA\Post(path: "/reset-password", summary: "Reset password with token", tags: ["Authentication"])]
    #[OA\Response(response: 200, description: "Password has been reset successfully")]
    #[OA\Response(response: 422, description: "Validation error")]
    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|min:8|confirmed',
        ]);

        try {
            $status = Password::reset(
                $request->only('email', 'password', 'password_confirmation', 'token'),
                function ($user, $password) {
                    $user->forceFill([
                        'password' => Hash::make($password)
                    ]);
                    $user->setRememberToken(Str::random(60));
                    $user->save();

                    event(new PasswordReset($user));
                }
            );
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Password reset failed: ' . $e->getMessage());

            if (config('app.debug')) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Password reset failed: ' . $e->getMessage(),
                    'error_debug' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                ], 500);
            }

            return response()->json([
                'status' => 'error',
                'message' => 'An unexpected server error occurred during password reset. Please check the logs.',
            ], 500);
        }

        return $status === Password::PASSWORD_RESET
            ? $this->successResponse(['message' => __($status)], __($status))
            : throw ValidationException::withMessages(['email' => [__($status)]]);
    }
}