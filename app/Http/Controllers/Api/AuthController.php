<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\StudentProfileRequest;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function __construct(
        private readonly AuthService $authService
    ) {
    }

    /**
     * Register a new mahasiswa account.
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        try {
            $data = $this->authService->register($request->validated());
            $userData = $this->authService->getAuthenticatedUser($data['user']);

            return response()->json([
                'status' => 'success',
                'message' => 'Registrasi berhasil.',
                'token' => $data['token'],
                'user' => $userData,
            ], 201);
        } catch (\Throwable $e) {
            Log::error('Register error', ['error' => $e->getMessage()]);
            return response()->json([
                'status' => 'error',
                'message' => 'Registrasi gagal. Silakan coba lagi.',
            ], 500);
        }
    }

    /**
     * Login and return token.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        try {
            $data = $this->authService->login($request->validated());
            $userData = $this->authService->getAuthenticatedUser($data['user']);

            return response()->json([
                'status' => 'success',
                'message' => 'Login berhasil.',
                'token' => $data['token'],
                'user' => $userData,
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
                'errors' => $e->errors(),
            ], 401);
        } catch (\Throwable $e) {
            Log::error('Login error', ['error' => $e->getMessage()]);
            return response()->json([
                'status' => 'error',
                'message' => 'Login gagal. Silakan coba lagi.',
            ], 500);
        }
    }

    /**
     * Logout and delete current token.
     */
    public function logout(Request $request): JsonResponse
    {
        try {
            $this->authService->logout($request->user());
            return response()->json([
                'status' => 'success',
                'message' => 'Logout berhasil.',
            ]);
        } catch (\Throwable $e) {
            Log::error('Logout error', ['error' => $e->getMessage()]);
            return response()->json([
                'status' => 'error',
                'message' => 'Logout gagal.',
            ], 500);
        }
    }

    /**
     * Return the currently authenticated user.
     */
    public function user(Request $request): JsonResponse
    {
        try {
            $userData = $this->authService->getAuthenticatedUser($request->user());
            return response()->json($userData);
        } catch (\Throwable $e) {
            Log::error('Fetch user error', ['error' => $e->getMessage()]);
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengambil data user.',
            ], 500);
        }
    }

    /**
     * Complete mahasiswa profile.
     */
    public function completeProfile(StudentProfileRequest $request): JsonResponse
    {
        try {
            $user = $this->authService->completeProfile(
                $request->user(),
                $request->validated()
            );

            $userData = $this->authService->getAuthenticatedUser($user);

            return response()->json([
                'status' => 'success',
                'message' => 'Profil berhasil dilengkapi.',
                'user' => $userData,
            ]);
        } catch (\Throwable $e) {
            Log::error('Complete profile error', ['error' => $e->getMessage()]);
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal melengkapi profil.',
            ], 500);
        }
    }
}
