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
        $role = $this->roleService->create($request->validated());
        return response()->json(new RoleResource($role), 201);
    }

    public function show(int $id)
    {
        $role = $this->roleService->getById($id);
        return response()->json(new RoleResource($role));
    }

    public function update(UpdateRoleRequest $request, int $id)
    {
        $role = $this->roleService->update($id, $request->validated());
        return response()->json(new RoleResource($role));
    }

    public function destroy(int $id)
    {
        $this->roleService->delete($id);
        return response()->json(['message' => 'Deleted']);
    }
}
