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

    public function index()
    {
        return response()->json($this->lecturerService->getAll());
    }

    public function store(StoreLecturerRequest $request)
    {
        $validated = $request->validated();
        
        // Flatten user data for service
        $data = [
            'nip' => $validated['nip'],
            'nidn' => $validated['nidn'] ?? null,
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone_number' => $validated['phone_number'] ?? null,
            'password' => $validated['password'] ?? 'dosen123',
        ];
        
        $lecturer = $this->lecturerService->create($data);
        return response()->json(new LecturerResource($lecturer), 201);
    }

    public function show(int $id)
    {
        $lecturer = $this->lecturerService->getById($id);
        return response()->json(new LecturerResource($lecturer));
    }

    public function update(UpdateLecturerRequest $request, int $id)
    {
        $validated = $request->validated();
        
        // Flatten user data for service
        $data = [
            'nip' => $validated['nip'],
            'nidn' => $validated['nidn'] ?? null,
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone_number' => $validated['phone_number'] ?? null,
        ];
        
        $lecturer = $this->lecturerService->update($id, $data);
        return response()->json(new LecturerResource($lecturer));
    }

    public function destroy(int $id)
    {
        $this->lecturerService->delete($id);
        return response()->json(['message' => 'Deleted']);
    }
}
