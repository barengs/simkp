<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreRoleRequest;
use App\Http\Requests\UpdateRoleRequest;
use App\Http\Resources\RoleResource;
use App\Services\RoleService;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    public function __construct(
        private readonly RoleService $roleService
    ) {
        $this->middleware('auth:sanctum');
        $this->middleware('permission:role.manage');
    }

    public function index()
    {
        return RoleResource::collection($this->roleService->getAll());
    }

    public function store(StoreRoleRequest $request)
    {
        try {
            $role = $this->roleService->create($request->validated());
            return response()->json(new RoleResource($role), 201);
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Gagal menyimpan data role.'], 500);
        }
    }

    public function show(int $id)
    {
        try {
            $role = $this->roleService->getById($id);
            return response()->json(new RoleResource($role));
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Data role tidak ditemukan.'], 404);
        }
    }

    public function update(UpdateRoleRequest $request, int $id)
    {
        try {
            $role = $this->roleService->update($id, $request->validated());
            return response()->json(new RoleResource($role));
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Gagal memperbarui data role.'], 500);
        }
    }

    public function destroy(int $id)
    {
        try {
            $this->roleService->delete($id);
            return response()->json(['message' => 'Data role berhasil dihapus']);
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Gagal menghapus data role. Pastikan data tidak sedang digunakan.'], 500);
        }
    }
}
