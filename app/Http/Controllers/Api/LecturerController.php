<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use App\Models\Lecturer;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class LecturerController extends Controller
{
    public function index(Request $request)
    {
        $query = User::where('role', 'dosen')->with('lecturer');

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%")
                  ->orWhereHas('lecturer', function ($q2) use ($request) {
                      $q2->where('nip', 'like', "%{$request->search}%");
                  });
            });
        }

        $lecturers = $query->latest()->paginate($request->per_page ?? 10);

        return response()->json([
            'status' => 'success',
            'data' => $lecturers
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'      =>  'required|string|max:255',
            'email'     =>  'required|email|unique:users,email',
            'password'  =>  'required|min:6',
            'nip'       =>  'required|string|unique:lecturers,nip',
            'phone'     =>  'required|string'
        ]);

        try {
            return DB::transaction(function () use ($request) {
                $user = User::create([
                    'name'      => $request->name,
                    'email'     => $request->email,
                    'password'  => Hash::make($request->password),
                    'role'      => 'dosen'
                ]);

                $user->lecturer()->create([
                    'nip'       => $request->nip,
                    'phone'     => $request->phone,
                ]);

                return response()->json([
                    'status'    => 'success',
                    'message'   => 'Dosen berhasil ditambahkan',
                    'data'      => $user->load('lecturer')
                ], 201);
            });
        } catch (\Exception $error) {
            return response()->json([
                'status'        => 'error',
                'message'       => 'Gagal menambahkan dosen: ' . $error->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $user = User::where('role', 'dosen')->findOrFail($id);

        $request->validate([
            'name'      =>  'required|string|max:255',
            'email'     =>  'required|email|unique:users,email,' . $user->id,
            'nip'       =>  'required|string|unique:lecturers,nip,' . ($user->lecturer->id ?? 'NULL'),
            'phone'     =>  'required|string'
        ]);

        try {
            return DB::transaction(function () use ($request, $user) {
                $user->update([
                    'name'  => $request->name,
                    'email' => $request->email,
                ]);

                if ($user->lecturer) {
                    $user->lecturer()->update([
                        'nip'   => $request->nip,
                        'phone' => $request->phone,
                    ]);
                } else {
                    $user->lecturer()->create([
                        'nip'   => $request->nip,
                        'phone' => $request->phone,
                    ]);
                }

                return response()->json([
                    'status'    => 'success',
                    'message'   => 'Dosen berhasil diperbarui',
                    'data'      => $user->load('lecturer')
                ]);
            });
        } catch (\Exception $error) {
            return response()->json([
                'status'        => 'error',
                'message'       => 'Gagal memperbarui dosen: ' . $error->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $user = User::where('role', 'dosen')->findOrFail($id);

        try {
            $user->delete();

            return response()->json([
                'status'    => 'success',
                'message'   => 'Dosen berhasil dihapus'
            ]);
        } catch (\Exception $error) {
            return response()->json([
                'status'    => 'error',
                'message'   => 'Gagal menghapus dosen: ' . $error->getMessage()
            ], 500);
        }
    }
}
