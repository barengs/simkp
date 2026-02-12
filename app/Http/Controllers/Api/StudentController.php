<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use App\Models\Student;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class StudentController extends Controller
{
    public function index(Request $request)
    {
        $query = Student::with('user');

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('nim', 'like', "%{$request->search}%")
                    ->orWhereHas('user', function ($q2) use ($request) {
                        $q2->where('name', 'like', "%{$request->search}%")
                            ->orWhere('email', 'like', "%{$request->search}%");
                    });
            });
        }

        $students = $query->latest()->paginate($request->per_page ?? 10);

        return response()->json([
            'status' => 'success',
            'data' => $students
        ]);
    }

    public function check(Request $request)
    {
        $request->validate([
            'npm' => 'required|string',
            'period_id' => 'required|exists:periods,id'
        ]);

        $student = Student::with('user')->where('nim', $request->npm)->first();

        if (!$student) {
            return response()->json(['message' => 'Mahasiswa tidak ditemukan'], 404);
        }

        // Check if student is already in an internship for this period
        $exists = \App\Models\InternshipMember::where('student_id', $student->id)
            ->whereHas('internship', function ($q) use ($request) {
                $q->where('period_id', $request->period_id)
                    ->where('status', '!=', 'rejected'); // Allow re-register if rejected? User didn't specify, assuming strict unique for now or status check
            })->exists();

        if ($exists) {
            return response()->json([
                'message' => 'Mahasiswa sudah terdaftar di kelompok lain pada periode ini',
                'can_join' => false,
                'student' => $student
            ]);
        }

        return response()->json([
            'message' => 'Mahasiswa tersedia',
            'can_join' => true,
            'student' => $student
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email',
            'password' => 'required|min:6',
            'nim' => 'required|string',
            'major' => 'required|string',
            'batch_year' => 'required|integer',
            'phone' => 'required|string',
        ]);

        try {
            return DB::transaction(function () use ($request) {
                // Check if user already exists
                $user = User::where('email', $request->email)->first();

                if (!$user) {
                    $user = User::create([
                        'name' => $request->name,
                        'email' => $request->email,
                        'password' => Hash::make($request->password),
                        'role' => 'mahasiswa'
                    ]);
                }

                // Check if student registration already exists for this period
                if (Student::where('nim', $request->nim)->exists()) {
                    throw new \Exception('Mahasiswa dengan NIM ini sudah terdaftar di periode ini.');
                }

                $student = $user->student()->create([
                    'nim' => $request->nim,
                    'major' => $request->major,
                    'batch_year' => $request->batch_year,
                    'phone' => $request->phone,
                ]);

                return response()->json([
                    'status' => 'success',
                    'message' => 'Mahasiswa berhasil ditambahkan ke periode ini',
                    'data' => $student->load('user')
                ], 201);
            });
        } catch (\Exception $error) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal menambahkan mahasiswa: ' . $error->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $student = Student::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email',
            'nim' => 'required|string',
            'major' => 'required|string',
            'batch_year' => 'required|integer',
            'phone' => 'required|string',
            'password' => 'nullable|min:6'
        ]);

        try {
            return DB::transaction(function () use ($request, $student) {
                // Update global user info
                $userData = [
                    'name' => $request->name,
                    'email' => $request->email,
                ];

                if ($request->password) {
                    $userData['password'] = Hash::make($request->password);
                }

                $student->user->update($userData);

                // Update period-specific student info
                $student->update([
                    'nim' => $request->nim,
                    'major' => $request->major,
                    'batch_year' => $request->batch_year,
                    'phone' => $request->phone,
                ]);

                return response()->json([
                    'status' => 'success',
                    'message' => 'Mahasiswa berhasil diperbarui',
                    'data' => $student->load('user')
                ]);
            });
        } catch (\Exception $error) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal memperbarui mahasiswa: ' . $error->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        $student = Student::findOrFail($id);

        try {
            // Only delete student record for this period
            $student->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Data mahasiswa di periode ini berhasil dihapus'
            ]);
        } catch (\Exception $error) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal menghapus mahasiswa: ' . $error->getMessage()
            ], 500);
        }
    }
}

