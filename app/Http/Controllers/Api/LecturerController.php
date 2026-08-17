<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreLecturerRequest;
use App\Http\Requests\UpdateLecturerRequest;
use App\Http\Resources\LecturerResource;
use App\Services\LecturerService;
use Illuminate\Http\Request;

class LecturerController extends Controller
{
    public function __construct(
        private readonly LecturerService $lecturerService
    ) {
        $this->middleware('auth:sanctum');
        // index & show terbuka untuk semua user terautentikasi.
        // Hanya CUD yang memerlukan permission master-data.manage.
        $this->middleware('permission:master-data.manage')->only(['store', 'update', 'destroy']);
    }

    public function index(Request $request)
    {
        $lecturers = $this->lecturerService->getPaginated($request->all());
        return LecturerResource::collection($lecturers);
    }

    public function store(StoreLecturerRequest $request)
    {
        try {
            $validated = $request->validated();
            
            $data = [
                'nip' => $validated['nip'],
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone_number' => $validated['phone_number'] ?? null,
                'password' => $validated['password'] ?? 'dosen123',
            ];
            
            $lecturer = $this->lecturerService->create($data);
            return response()->json(new LecturerResource($lecturer), 201);
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Gagal menyimpan data dosen.'], 500);
        }
    }

    public function show(int $id)
    {
        try {
            $lecturer = $this->lecturerService->getById($id);
            return response()->json(new LecturerResource($lecturer));
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Data dosen tidak ditemukan.'], 404);
        }
    }

    public function update(UpdateLecturerRequest $request, int $id)
    {
        try {
            $validated = $request->validated();
            
            $data = [
                'nip' => $validated['nip'],
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone_number' => $validated['phone_number'] ?? null,
            ];
            
            $lecturer = $this->lecturerService->update($id, $data);
            return response()->json(new LecturerResource($lecturer));
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Gagal memperbarui data dosen.'], 500);
        }
    }

    public function destroy(int $id)
    {
        try {
            $this->lecturerService->delete($id);
            return response()->json(['message' => 'Data dosen berhasil dihapus']);
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Gagal menghapus data dosen. Pastikan data tidak sedang digunakan.'], 500);
        }
    }
}
