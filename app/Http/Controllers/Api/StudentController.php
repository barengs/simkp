<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreStudentRequest;
use App\Http\Requests\UpdateStudentRequest;
use App\Http\Resources\StudentResource;
use App\Services\StudentService;
use Illuminate\Http\Request;

class StudentController extends Controller
{
    public function __construct(
        private readonly StudentService $studentService
    ) {
        $this->middleware('auth:sanctum');
        // index & show terbuka untuk semua user terautentikasi — mahasiswa perlu
        // baca daftar student untuk mencari anggota kelompok by NIM.
        // Hanya CUD yang memerlukan permission master-data.manage.
        $this->middleware('permission:master-data.manage')->only(['store', 'update', 'destroy']);
    }

    public function index(Request $request)
    {
        $students = $this->studentService->getPaginated($request->all());
        return StudentResource::collection($students);
    }

    public function store(StoreStudentRequest $request)
    {
        try {
            $validated = $request->validated();
            
            $data = [
                'nim' => $validated['nim'],
                'study_program_id' => $validated['study_program_id'],
                'is_active' => $validated['is_active'] ?? true,
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone_number' => $validated['phone_number'] ?? null,
                'password' => $validated['password'] ?? 'mhs123',
            ];
            
            $student = $this->studentService->create($data);
            return response()->json(new StudentResource($student), 201);
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Gagal menyimpan data mahasiswa.'], 500);
        }
    }

    public function show(int $id)
    {
        try {
            $student = $this->studentService->getById($id);
            return response()->json(new StudentResource($student));
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Data mahasiswa tidak ditemukan.'], 404);
        }
    }

    public function update(UpdateStudentRequest $request, int $id)
    {
        try {
            $validated = $request->validated();
            
            $data = [
                'nim' => $validated['nim'],
                'study_program_id' => $validated['study_program_id'],
                'is_active' => $validated['is_active'] ?? true,
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone_number' => $validated['phone_number'] ?? null,
            ];
            
            $student = $this->studentService->update($id, $data);
            return response()->json(new StudentResource($student));
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Gagal memperbarui data mahasiswa.'], 500);
        }
    }

    public function destroy(int $id)
    {
        try {
            $this->studentService->delete($id);
            return response()->json(['message' => 'Data mahasiswa berhasil dihapus']);
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Gagal menghapus data mahasiswa. Pastikan data tidak sedang digunakan.'], 500);
        }
    }
}
