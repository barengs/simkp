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
        $query = Lecturer::with('user');

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('nip', 'like', "%{$request->search}%")
                  ->orWhereHas('user', function ($q2) use ($request) {
                      $q2->where('name', 'like', "%{$request->search}%")
                         ->orWhere('email', 'like', "%{$request->search}%");
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
            'email'     =>  'required|email',
            'password'  =>  'required|min:6',
            'nip'       =>  'required|string',
            'phone'     =>  'required|string'
        ]); 

        try {
            return DB::transaction(function () use ($request) {
                // Check if user already exists
                $user = User::where('email', $request->email)->first();
                
                if (!$user) {
                    $user = User::create([
                        'name'      => $request->name,
                        'email'     => $request->email,
                        'password'  => Hash::make($request->password),
                        'role'      => 'dosen'
                    ]);
                }

                // Check if lecturer registration already exists for this period
                // The Global Scope will automatically check for active period_id
                if (Lecturer::where('nip', $request->nip)->exists()) {
                    throw new \Exception('Dosen dengan NIP ini sudah terdaftar di periode ini.');
                }

                $lecturer = $user->lecturer()->create([
                    'nip'       => $request->nip,
                    'phone'     => $request->phone,
                ]);

                return response()->json([
                    'status'    => 'success',
                    'message'   => 'Dosen berhasil ditambahkan ke periode ini',
                    'data'      => $lecturer->load('user')
                ], 201);
            });
        } catch (\Exception $error) {
            return response()->json([
                'status'        => 'error',
                'message'       => 'Gagal menambahkan dosen: ' . $error->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $lecturer = Lecturer::findOrFail($id);

        $request->validate([
            'name'      =>  'required|string|max:255',
            'email'     =>  'required|email',
            'nip'       =>  'required|string',
            'phone'     =>  'required|string'
        ]);

        try {
            return DB::transaction(function () use ($request, $lecturer) {
                // Update global user info
                $lecturer->user->update([
                    'name'  => $request->name,
                    'email' => $request->email,
                ]);

                // Update period-specific lecturer info
                $lecturer->update([
                    'nip'   => $request->nip,
                    'phone' => $request->phone,
                ]);

                return response()->json([
                    'status'    => 'success',
                    'message'   => 'Dosen berhasil diperbarui',
                    'data'      => $lecturer->load('user')
                ]);
            });
        } catch (\Exception $error) {
            return response()->json([
                'status'        => 'error',
                'message'       => 'Gagal memperbarui dosen: ' . $error->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        $lecturer = Lecturer::findOrFail($id);

        try {
            // We only delete the lecturer record for this period
            // The User record remains global
            $lecturer->delete();

            return response()->json([
                'status'    => 'success',
                'message'   => 'Data dosen di periode ini berhasil dihapus'
            ]);
        } catch (\Exception $error) {
            return response()->json([
                'status'    => 'error',
                'message'   => 'Gagal menghapus dosen: ' . $error->getMessage()
            ], 500);
        }
    }
}

