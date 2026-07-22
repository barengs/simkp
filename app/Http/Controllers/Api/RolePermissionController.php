<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class RolePermissionController extends Controller
{
    /**
     * List all roles with their assigned permissions.
     */
    public function index()
    {
        // Only return api guard roles to frontend
        $roles = Role::where('guard_name', 'api')
            ->with('permissions')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $roles
        ]);
    }

    /**
     * Store a newly created role.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => [
                'required',
                'string',
                Rule::unique('roles', 'name')->where('guard_name', 'api'),
            ],
            'permissions' => 'nullable|array',
            'permissions.*' => 'string|exists:permissions,name',
        ]);

        try {
            DB::beginTransaction();

            // Create under both guards for double compatibility as in seeders
            $roleApi = Role::create([
                'name' => strtolower($request->name),
                'guard_name' => 'api'
            ]);

            $roleWeb = Role::create([
                'name' => strtolower($request->name),
                'guard_name' => 'web'
            ]);

            if ($request->has('permissions')) {
                $permissionsApi = Permission::where('guard_name', 'api')
                    ->whereIn('name', $request->permissions)
                    ->get();
                $permissionsWeb = Permission::where('guard_name', 'web')
                    ->whereIn('name', $request->permissions)
                    ->get();
                
                $roleApi->syncPermissions($permissionsApi);
                $roleWeb->syncPermissions($permissionsWeb);
            }

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Peran berhasil dibuat.',
                'data' => $roleApi->load('permissions')
            ], 201);

        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal membuat peran: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified role.
     */
    public function update(Request $request, $id)
    {
        $roleApi = Role::where('id', $id)->where('guard_name', 'api')->firstOrFail();
        
        $request->validate([
            'name' => [
                'required',
                'string',
                Rule::unique('roles', 'name')->where('guard_name', 'api')->ignore($id),
            ],
            'permissions' => 'nullable|array',
            'permissions.*' => 'string|exists:permissions,name',
        ]);

        try {
            DB::beginTransaction();

            $oldName = $roleApi->name;
            $newName = strtolower($request->name);

            // Update api role
            $roleApi->update(['name' => $newName]);

            // Update corresponding web role if exists
            $roleWeb = Role::where('name', $oldName)->where('guard_name', 'web')->first();
            if ($roleWeb) {
                $roleWeb->update(['name' => $newName]);
            } else {
                $roleWeb = Role::create(['name' => $newName, 'guard_name' => 'web']);
            }

            if ($request->has('permissions')) {
                $permissionsApi = Permission::where('guard_name', 'api')
                    ->whereIn('name', $request->permissions)
                    ->get();
                $permissionsWeb = Permission::where('guard_name', 'web')
                    ->whereIn('name', $request->permissions)
                    ->get();

                $roleApi->syncPermissions($permissionsApi);
                $roleWeb->syncPermissions($permissionsWeb);
            }

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Peran berhasil diperbarui.',
                'data' => $roleApi->load('permissions')
            ]);

        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal memperbarui peran: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified role.
     */
    public function destroy($id)
    {
        $roleApi = Role::where('id', $id)->where('guard_name', 'api')->firstOrFail();

        try {
            DB::beginTransaction();

            $name = $roleApi->name;

            // Delete api Role
            $roleApi->delete();

            // Delete web Role if exists
            Role::where('name', $name)->where('guard_name', 'web')->delete();

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Peran berhasil dihapus.'
            ]);

        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal menghapus peran: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * List all permissions.
     */
    public function permissions()
    {
        $permissions = Permission::where('guard_name', 'api')->get();

        return response()->json([
            'status' => 'success',
            'data' => $permissions
        ]);
    }

    /**
     * List users with their roles (paginated/filterable).
     */
    public function users(Request $request)
    {
        $search = $request->query('search');

        $users = User::query()
            ->when($search, function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            })
            ->with('roles')
            ->paginate($request->query('limit', 10));

        // Format to include plain array of roles
        $users->getCollection()->transform(function ($user) {
            $user->role_names = $user->roles->pluck('name')->toArray();
            unset($user->roles);
            return $user;
        });

        return response()->json([
            'status' => 'success',
            'data' => $users
        ]);
    }

    /**
     * Assign / sync roles to a user.
     */
    public function assignUserRoles(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'roles' => 'required|array',
            'roles.*' => 'string|exists:roles,name',
        ]);

        try {
            DB::beginTransaction();

            // Sync user roles using Spatie
            $user->syncRoles($request->roles);

            // Sync legacy role column using priority (admin > koordinator > pembimbing > penguji > mhs)
            $primary = User::resolvePrimaryRole($request->roles);
            if ($primary) {
                $user->role = $primary;
                $user->saveQuietly();
            }

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Peran pengguna berhasil diperbarui.',
                'data' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'roles' => $user->getRoleNames()->toArray(),
                ]
            ]);

        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengubah peran pengguna: ' . $e->getMessage()
            ], 500);
        }
    }
}
