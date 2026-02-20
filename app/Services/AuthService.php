<?php

namespace App\Services;

use App\Models\User;
use App\Models\Student;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class AuthService
{
    /**
     * Register a new mahasiswa user.
     */
    public function register(array $data): array
    {
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role' => 'mahasiswa',
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        Log::info('User registered', ['user_id' => $user->id, 'email' => $user->email]);

        return [
            'user' => $user,
            'token' => $token,
        ];
    }

    /**
     * Login user and create token.
     */
    public function login(array $credentials): array
    {
        $user = User::where('email', $credentials['email'])->first();

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Email atau Password salah'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        Log::info('User logged in', ['user_id' => $user->id]);

        return [
            'user' => $user,
            'token' => $token,
        ];
    }

    /**
     * Logout user (delete current token).
     */
    public function logout(User $user): void
    {
        $user->currentAccessToken()->delete();
        Log::info('User logged out', ['user_id' => $user->id]);
    }

    /**
     * Get current authenticated user with profile data.
     */
    public function getAuthenticatedUser(User $user): array
    {
        $userData = $user->toArray();
        $userData['is_profile_complete'] = $this->checkProfileComplete($user);

        if ($user->role === 'mahasiswa') {
            $userData['redirect_url'] = $userData['is_profile_complete'] ? '/' : '/student/profile';
            $userData['student'] = Student::where('user_id', $user->id)->first();
        } elseif ($user->role === 'admin') {
            $userData['redirect_url'] = '/';
        } elseif ($user->role === 'dosen') {
            $userData['redirect_url'] = '/';
        }

        return $userData;
    }

    /**
     * Complete mahasiswa profile.
     */
    public function completeProfile(User $user, array $data): User
    {
        $activePeriod = \App\Models\Period::where('is_active', true)->first();

        Student::updateOrCreate(
            ['user_id' => $user->id],
            [
                'period_id' => $activePeriod?->id,
                'nim' => $data['nim'],
                'major' => $data['major'],
                'batch_year' => $data['batch_year'],
                'phone' => $data['phone'] ?? null,
            ]
        );

        Log::info('Profile completed', ['user_id' => $user->id]);

        return $user->fresh();
    }

    /**
     * Check if mahasiswa profile is complete.
     */
    private function checkProfileComplete(User $user): bool
    {
        if ($user->role !== 'mahasiswa') {
            return true;
        }
        return Student::where('user_id', $user->id)->exists();
    }
}
