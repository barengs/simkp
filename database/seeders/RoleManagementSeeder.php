<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RoleManagementSeeder extends Seeder
{
    public function run(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $allPermissions = [
            'pengaturan.manage',
            'master-data.manage',
            'role.manage',
            'permission.manage',
            'kp.kelompok.create',
            'kp.kelompok.view',
            'kp.verifikasi-pendaftaran',
            'kp.plotting-dosen',
            'kp.logbook.input',
            'kp.logbook.approve',
            'kp.laporan.input',
            'kp.laporan.approve',
            'kp.nilai.input',
            'ta.pengajuan.create',
            'ta.verifikasi-judul',
            'ta.plotting-dosen',
            'ta.bimbingan.approve',
            'ta.nilai.input',
            'repository.publish',
            'repository.view',
        ];

        foreach ($allPermissions as $name) {
            Permission::findOrCreate($name, 'web');
        }

        $roleAdmin       = Role::findOrCreate('admin', 'web');
        $roleKoordinator = Role::findOrCreate('koordinator', 'web');
        $roleDosen       = Role::findOrCreate('dosen', 'web');
        $roleMahasiswa   = Role::findOrCreate('mahasiswa', 'web');

        $roleAdmin->syncPermissions(Permission::all());

        $roleKoordinator->syncPermissions([
            'kp.verifikasi-pendaftaran',
            'kp.kelompok.view',
            'kp.plotting-dosen',
            'ta.verifikasi-judul',
            'ta.plotting-dosen',
            'repository.publish',
            'repository.view',
        ]);

        $roleDosen->syncPermissions([
            'kp.kelompok.view',
            'kp.plotting-dosen',
            'kp.logbook.approve',
            'kp.laporan.approve',
            'kp.nilai.input',
            'ta.bimbingan.approve',
            'ta.nilai.input',
            'repository.view',
        ]);

        $roleMahasiswa->syncPermissions([
            'kp.kelompok.create',
            'kp.kelompok.view',
            'kp.logbook.input',
            'kp.laporan.input',
            'ta.pengajuan.create',
            'repository.view',
        ]);

        $demoUsers = [
            ['name' => 'Administrator SIMKP', 'email' => 'admin@simkpta.test', 'password' => 'password', 'role' => 'admin'],
            ['name' => 'Koordinator KP/TA', 'email' => 'koordinator@simkpta.test', 'password' => 'password', 'role' => 'koordinator'],
            ['name' => 'Dosen Demo', 'email' => 'dosen@simkpta.test', 'password' => 'password', 'role' => 'dosen'],
            ['name' => 'Mahasiswa Demo', 'email' => 'mahasiswa@simkpta.test', 'password' => 'password', 'role' => 'mahasiswa'],
        ];

        foreach ($demoUsers as $data) {
            $user = User::updateOrCreate(
                ['email' => $data['email']],
                [
                    'name' => $data['name'],
                    'password' => Hash::make($data['password']),
                    'email_verified_at' => now(),
                ]
            );
            $user->syncRoles([$data['role']]);
        }

        app()[PermissionRegistrar::class]->forgetCachedPermissions();
    }
}
