<?php

namespace Database\Seeders;

use App\Models\ApplicationSetting;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            'master-data.manage',
            'pengaturan.manage',
            'kp.verifikasi-pendaftaran',
            'kp.kelompok.create',
            'kp.kelompok.view',
            'kp.logbook.approve',
            'kp.logbook.input',
            'kp.plotting.dosen',
            'kp.nilai.input',
            'ta.judul.verifikasi',
            'ta.bimbingan.approve',
            'ta.jadwal.manage',
            'ta.nilai.input',
            'repository.publish',
            'repository.view',
        ];

        foreach ($permissions as $name) {
            Permission::findOrCreate($name, 'web');
        }

        $admin = Role::findOrCreate('admin', 'web');
        $koordinator = Role::findOrCreate('koordinator', 'web');
        $dosen = Role::findOrCreate('dosen', 'web');
        $mahasiswa = Role::findOrCreate('mahasiswa', 'web');

        $admin->syncPermissions(Permission::all());

        $koordinator->syncPermissions([
            'kp.verifikasi-pendaftaran',
            'kp.kelompok.view',
            'kp.plotting.dosen',
            'ta.judul.verifikasi',
            'ta.jadwal.manage',
            'repository.view',
        ]);

        $dosen->syncPermissions([
            'kp.logbook.approve',
            'kp.nilai.input',
            'kp.kelompok.view',
            'ta.bimbingan.approve',
            'ta.nilai.input',
            'repository.view',
        ]);

        $mahasiswa->syncPermissions([
            'kp.kelompok.create',
            'kp.kelompok.view',
            'kp.logbook.input',
            'repository.view',
        ]);

        $users = [
            [
                'name' => 'Administrator',
                'email' => 'admin@simkpta.test',
                'password' => 'password',
                'role' => 'admin',
            ],
            [
                'name' => 'Koordinator KP',
                'email' => 'koordinator@simkpta.test',
                'password' => 'password',
                'role' => 'koordinator',
            ],
            [
                'name' => 'Dosen Pembimbing',
                'email' => 'dosen@simkpta.test',
                'password' => 'password',
                'role' => 'dosen',
            ],
            [
                'name' => 'Mahasiswa Demo',
                'email' => 'mahasiswa@simkpta.test',
                'password' => 'password',
                'role' => 'mahasiswa',
            ],
        ];

        foreach ($users as $data) {
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

        $defaults = [
            'app_name' => 'SIM-KPTA',
            'logo_path' => null,
            'favicon_path' => null,
            'kp_jumlah_anggota_default' => '3',
        ];

        foreach ($defaults as $key => $value) {
            ApplicationSetting::updateOrCreate(
                ['key' => $key],
                ['value' => $value, 'type' => 'string']
            );
        }
    }
}
