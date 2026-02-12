<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\AuthService;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    protected $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        try {
            $data = $this->authService->login($request->only('email', 'password'));

            return response()->json([
                'status' => 'success',
                'message' => 'Login berhasil',
                'token' => $data['token'],
                'user' => $data['user'],
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
                'errors' => $e->errors()
            ], 401);
        }
    }

    public function me(Request $request)
    {
        $user = $this->authService->getCurrentUser($request->user());
        return response()->json($user);
    }

    public function logout(Request $request)
    {
        $this->authService->logout($request->user());

        return response()->json([
            'status' => 'success',
            'message' => 'Berhasil Keluar'
        ]);
    }
}
