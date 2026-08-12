<?php

namespace App\Services;

use App\Models\Role;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

class RoleService
{
    public function getAll(): \Illuminate\Database\Eloquent\Collection
    {
        return Role::with('permissions')->get();
    }

    public function getById(int $id): Role
    {
        return Role::with('permissions')->findOrFail($id);
    }

    public function create(array $data): Role
    {
        return DB::transaction(function () use ($data) {
            $role = Role::create([
                'name' => $data['name'],
                'guard_name' => 'web',
                'description' => $data['description'] ?? null,
            ]);

            if (!empty($data['permissions'])) {
                $role->syncPermissions($data['permissions']);
            }

            app()[PermissionRegistrar::class]->forgetCachedPermissions();

            return $role->load('permissions');
        });
    }

    public function update(int $id, array $data): Role
    {
        return DB::transaction(function () use ($id, $data) {
            $role = Role::findOrFail($id);

            $role->update([
                'name' => $data['name'],
                'description' => $data['description'] ?? $role->description,
            ]);

            if (array_key_exists('permissions', $data)) {
                $role->syncPermissions($data['permissions']);
            }

            app()[PermissionRegistrar::class]->forgetCachedPermissions();

            return $role->load('permissions');
        });
    }

    public function delete(int $id): bool
    {
        $role = Role::findOrFail($id);
        $role->delete();

        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        return true;
    }
}
