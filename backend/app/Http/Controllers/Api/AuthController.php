<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
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

        // Login immediately
        Auth::login($user);

        return response()->json(['user' => $user, 'token' => $user->createToken('auth')->plainTextToken]);
    }

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

        return response()->json(['user' => $user, 'token' => $user->createToken('auth')->plainTextToken]);
    }

    public function logout(Request $request)
    {
        // Revoke tokens
        $request->user()->tokens()->delete();
        Auth::guard('web')->logout();

        return response()->json(['message' => 'Logged out']);
    }

    public function user(Request $request)
    {
        return $request->user();
    }

    /**
     * Search for players by name
     */
    public function searchPlayers(Request $request)
    {
        $query = $request->query('query');
        
        if (empty($query)) {
            return response()->json([]);
        }

        $users = User::where('name', 'LIKE', "%{$query}%")
            ->where('id', '!=', $request->user()->id)
            ->where('role', 'player')
            ->limit(10)
            ->get(['id', 'name']);

        return response()->json($users);
    }
}
