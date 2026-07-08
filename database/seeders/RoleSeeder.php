<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Create permissions if they do not exist
        $permissions = [
            'manage periods',
            'manage themes',
            'manage master data',
            'manage internships',
            'view internships',
            'validate logbook',
            'validate report',
            'score internships',
            'manage ta',
            'manage settings',
            'manage roles',
            'student registration',
            'student logbook',
            'student report',
            'student evaluation',
            'student ta',
            'manage profile',
        ];

        foreach ($permissions as $permissionName) {
            Permission::firstOrCreate(['name' => $permissionName, 'guard_name' => 'api']);
            Permission::firstOrCreate(['name' => $permissionName, 'guard_name' => 'web']);
        }

        // 2. Create Roles if they do not exist
        $roles = [
            'mahasiswa',
            'koordinator_ta',
            'dosen_pembimbing',
            'dosen_penguji',
            'admin',
        ];

        foreach ($roles as $roleName) {
            Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'api']);
            Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'web']); // for double compatibility
        }

        // 3. Sync permissions to roles
        $collegeStudentPermissions = [
            'student registration',
            'student logbook',
            'student report',
            'student evaluation',
            'student ta',
        ];
        
        $lecturerPermissions = [
            'view internships',
            'validate logbook',
            'validate report',
            'score internships',
        ];

        $koordinatorPerms = [
            'manage ta',
            'view internships',
        ];

        // Assign to api guard (primary)
        $adminRoleApi = Role::where(['name' => 'admin', 'guard_name' => 'api'])->first();
        if ($adminRoleApi) {
            $adminRoleApi->syncPermissions(Permission::where('guard_name', 'api')->get());
        }

        $mhsRoleApi = Role::where(['name' => 'mahasiswa', 'guard_name' => 'api'])->first();
        if ($mhsRoleApi) {
            $mhsRoleApi->syncPermissions(Permission::where('guard_name', 'api')->whereIn('name', $collegeStudentPermissions)->get());
        }

        $pembimbingRoleApi = Role::where(['name' => 'dosen_pembimbing', 'guard_name' => 'api'])->first();
        if ($pembimbingRoleApi) {
            $pembimbingRoleApi->syncPermissions(Permission::where('guard_name', 'api')->whereIn('name', $lecturerPermissions)->get());
        }

        $pengujiRoleApi = Role::where(['name' => 'dosen_penguji', 'guard_name' => 'api'])->first();
        if ($pengujiRoleApi) {
            $pengujiRoleApi->syncPermissions(Permission::where('guard_name', 'api')->whereIn('name', $lecturerPermissions)->get());
        }

        $koordinatorRoleApi = Role::where(['name' => 'koordinator_ta', 'guard_name' => 'api'])->first();
        if ($koordinatorRoleApi) {
            $koordinatorRoleApi->syncPermissions(Permission::where('guard_name', 'api')->whereIn('name', $koordinatorPerms)->get());
        }

        // Assign to web guard (double compatibility)
        $adminRoleWeb = Role::where(['name' => 'admin', 'guard_name' => 'web'])->first();
        if ($adminRoleWeb) {
            $adminRoleWeb->syncPermissions(Permission::where('guard_name', 'web')->get());
        }

        $mhsRoleWeb = Role::where(['name' => 'mahasiswa', 'guard_name' => 'web'])->first();
        if ($mhsRoleWeb) {
            $mhsRoleWeb->syncPermissions(Permission::where('guard_name', 'web')->whereIn('name', $collegeStudentPermissions)->get());
        }

        $pembimbingRoleWeb = Role::where(['name' => 'dosen_pembimbing', 'guard_name' => 'web'])->first();
        if ($pembimbingRoleWeb) {
            $pembimbingRoleWeb->syncPermissions(Permission::where('guard_name', 'web')->whereIn('name', $lecturerPermissions)->get());
        }

        $pengujiRoleWeb = Role::where(['name' => 'dosen_penguji', 'guard_name' => 'web'])->first();
        if ($pengujiRoleWeb) {
            $pengujiRoleWeb->syncPermissions(Permission::where('guard_name', 'web')->whereIn('name', $lecturerPermissions)->get());
        }

        $koordinatorRoleWeb = Role::where(['name' => 'koordinator_ta', 'guard_name' => 'web'])->first();
        if ($koordinatorRoleWeb) {
            $koordinatorRoleWeb->syncPermissions(Permission::where('guard_name', 'web')->whereIn('name', $koordinatorPerms)->get());
        }

        // 4. Map existing users to their corresponding roles based on their current role column
        $users = User::all();
        foreach ($users as $user) {
            $roleName = strtolower($user->role);
            if (in_array($roleName, ['mahasiswa', 'dosen', 'admin'])) {
                // If it's dosen, map to dosen_pembimbing and dosen_penguji by default
                if ($roleName === 'dosen') {
                    $user->assignRole('dosen_pembimbing');
                    $user->assignRole('dosen_penguji');
                } else {
                    $user->assignRole($roleName);
                }
            }
        }
    }
}
