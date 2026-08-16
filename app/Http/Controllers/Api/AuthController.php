<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Spatie\Permission\PermissionRegistrar;

class AuthController extends Controller
{
    private function userResponse(User $user): array
    {
        $user->load('roles', 'permissions', 'student', 'lecturer');

        $student = $user->student;

        return [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'profile_picture_url' => $user->profile_picture_url,
                'phone_number' => $user->phone_number,
                'lecturer_id' => $user->lecturer?->id,
                'lecturer' => $user->lecturer ? [
                    'id' => $user->lecturer->id,
                    'nidn' => $user->lecturer->nidn,
                ] : null,
                'student_id' => $student?->id,
                'student' => $student ? [
                    'id' => $student->id,
                    'nim' => $student->nim,
                    'study_program_id' => $student->study_program_id,
                    'kp_group_members' => $student->kpGroupMembers()->with('kpGroup')->get()->map(function ($m) {
                        return [
                            'kp_group_id' => $m->kp_group_id,
                            'role' => $m->role,
                            'member_status' => $m->status,
                            'group_status' => $m->kpGroup->status ?? null,
                            'group_supervisor' => $m->kpGroup->members()->whereNotNull('supervisor_lecturer_id')->first()?->supervisor ? [
                                'id' => $m->kpGroup->members()->whereNotNull('supervisor_lecturer_id')->first()->supervisor->id,
                                'name' => $m->kpGroup->members()->whereNotNull('supervisor_lecturer_id')->first()->supervisor->name,
                            ] : null,
                        ];
                    })->toArray(),
                ] : null,
            ],
            'roles' => $user->getRoleNames()->values(),
            'permissions' => $user->getAllPermissions()->pluck('name')->values(),
        ];
    }

    public function login(LoginRequest $request)
    {
        $credentials = $request->validated();

        if (! Auth::attempt($credentials, $request->boolean('remember'))) {
            throw ValidationException::withMessages([
                'email' => ['Email atau password salah.'],
            ]);
        }

        $request->session()->regenerate();

        return response()->json($this->userResponse($request->user()));
    }

    public function logout(Request $request)
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'Logged out']);
    }

    public function user(Request $request)
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        return response()->json($this->userResponse($user));
    }
}
