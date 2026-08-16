<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class UserController extends Controller
{
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'profile_picture' => ['nullable', 'image', 'max:2048'],
        ]);

        $user->name = $data['name'];
        $user->email = $data['email'];

        if ($request->hasFile('profile_picture')) {
            if ($user->profile_picture_url) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $user->profile_picture_url));
            }

            $path = $request->file('profile_picture')->store('profile-pictures', 'public');
            $user->profile_picture_url = '/storage/' . $path;
        }

        $user->save();

        return response()->json([
            'message' => 'Profil berhasil diperbarui',
            'user' => new UserResource($user->load('roles', 'permissions')),
        ]);
    }
}
