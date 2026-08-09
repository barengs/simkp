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
        // Bersihkan cache permission agar perubahan langsung efektif
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // =====================================================================
        // LANGKAH 1 — Buat semua permission (sesuai Blueprint bagian 2)
        //
        // Konvensi nama: domain.aksi  atau  domain.sub-domain.aksi
        // Huruf kecil, dash (-) untuk multi-kata, titik (.) sebagai pemisah domain.
        //
        // PENTING: SELURUH permission dibuat di sini dulu, BARU role di-assign
        //          di bawah (syncPermissions dipanggil setelah loop ini selesai).
        //          Jika urutan terbalik, Permission::all() pada admin akan
        //          menangkap permission lama saja dan permission baru yang baru
        //          saja dibuat tidak ikut ter-assign.
        // =====================================================================
        $allPermissions = [
            // ── Pengaturan Aplikasi ──────────────────────────────────────────
            // Admin: ubah app_name, logo, favicon, jumlah anggota kelompok
            'pengaturan.manage',

            // ── Master Data ──────────────────────────────────────────────────
            // Admin: kelola prodi, periode, ruangan, perusahaan KP, tema KP,
            //        jenis dokumen, dosen, mahasiswa
            'master-data.manage',

            // ── Manajemen Role & Permission (RBAC) ───────────────────────────
            // Admin: buat/edit/hapus role dan assignment permission
            'role.manage',
            'permission.manage',

            // ── Modul KP — Kelompok ──────────────────────────────────────────
            'kp.kelompok.create',   // Mahasiswa: buat kelompok KP
            'kp.kelompok.view',     // Koordinator / Dosen / Admin: lihat daftar kelompok

            // ── Modul KP — Verifikasi & Plotting ────────────────────────────
            'kp.verifikasi-pendaftaran', // Admin, Koordinator: verifikasi pendaftaran kelompok
            'kp.plotting-dosen',         // Koordinator: assign dosen pembimbing ke kelompok

            // ── Modul KP — Logbook ───────────────────────────────────────────
            'kp.logbook.input',    // Mahasiswa: input entri logbook
            'kp.logbook.approve',  // Dosen (jika pembimbing kelompok): approve logbook

            // ── Modul KP — Laporan ───────────────────────────────────────────
            'kp.laporan.approve',  // Dosen (jika pembimbing kelompok): approve laporan KP

            // ── Modul KP — Nilai ─────────────────────────────────────────────
            'kp.nilai.input',      // Dosen (jika pembimbing kelompok): input nilai KP

            // ── Modul TA — Pengajuan & Verifikasi ───────────────────────────
            'ta.pengajuan.create',   // Mahasiswa: ajukan judul TA
            'ta.verifikasi-judul',   // Koordinator: verifikasi / tolak judul TA
            'ta.plotting-dosen',     // Koordinator: assign dosen pembimbing & penguji TA

            // ── Modul TA — Bimbingan ─────────────────────────────────────────
            'ta.bimbingan.approve',  // Dosen (jika pembimbing): approve sesi bimbingan TA

            // ── Modul TA — Nilai ─────────────────────────────────────────────
            'ta.nilai.input',        // Dosen (jika penguji): input nilai ujian TA

            // ── Repository ───────────────────────────────────────────────────
            'repository.publish',  // Admin, Koordinator: publikasi dokumen TA
            'repository.view',     // Semua role: lihat repository publik
        ];

        foreach ($allPermissions as $name) {
            Permission::findOrCreate($name, 'web');
        }

        // =====================================================================
        // LANGKAH 2 — Buat role (sesuai Blueprint bagian 2, tabel Role)
        // =====================================================================
        $roleAdmin       = Role::findOrCreate('admin', 'web');
        $roleKoordinator = Role::findOrCreate('koordinator', 'web');
        $roleDosen       = Role::findOrCreate('dosen', 'web');
        $roleMahasiswa   = Role::findOrCreate('mahasiswa', 'web');

        // =====================================================================
        // LANGKAH 3 — Assign permission ke role
        //
        // syncPermissions dipanggil DI SINI, setelah semua permission selesai
        // dibuat di langkah 1, sehingga Permission::all() sudah lengkap.
        //
        // Referensi: Blueprint_SIMKPTA.md — Tabel Permission bagian 2
        // =====================================================================

        // Admin → semua permission
        $roleAdmin->syncPermissions(Permission::all());

        // Koordinator → verifikasi & plotting KP/TA, monitoring, repository
        $roleKoordinator->syncPermissions([
            'kp.verifikasi-pendaftaran',
            'kp.kelompok.view',
            'kp.plotting-dosen',
            'ta.verifikasi-judul',
            'ta.plotting-dosen',
            'repository.publish',
            'repository.view',
        ]);

        // Dosen → aksi pada kelompok/mahasiswa yang dibimbing/diuji
        // (validasi kepemilikan relasi spesifik tetap di backend via Policy)
        $roleDosen->syncPermissions([
            'kp.kelompok.view',
            'kp.logbook.approve',
            'kp.laporan.approve',
            'kp.nilai.input',
            'ta.bimbingan.approve',
            'ta.nilai.input',
            'repository.view',
        ]);

        // Mahasiswa → aksi di KP dan TA milik sendiri / kelompoknya
        $roleMahasiswa->syncPermissions([
            'kp.kelompok.create',
            'kp.kelompok.view',
            'kp.logbook.input',
            'ta.pengajuan.create',
            'repository.view',
        ]);

        // =====================================================================
        // LANGKAH 4 — User demo (satu akun per role, untuk development/testing)
        //
        //  Email                         | Password  | Role
        //  ------------------------------|-----------|-------------
        //  admin@simkpta.test            | password  | admin
        //  koordinator@simkpta.test      | password  | koordinator
        //  dosen@simkpta.test            | password  | dosen
        //  mahasiswa@simkpta.test        | password  | mahasiswa
        //
        // Hak akses per role sudah tercantum di komentar LANGKAH 3 di atas.
        // syncRoles() menjamin tepat satu role per user (mengganti role lama).
        // =====================================================================
        $demoUsers = [
            [
                'name'     => 'Administrator SIMKP',
                'email'    => 'admin@simkpta.test',
                'password' => 'password',
                'role'     => 'admin',
                // Hak akses: semua permission (pengaturan.manage, master-data.manage,
                //            role.manage, permission.manage, kp.*, ta.*, repository.*)
            ],
            [
                'name'     => 'Koordinator KP/TA',
                'email'    => 'koordinator@simkpta.test',
                'password' => 'password',
                'role'     => 'koordinator',
                // Hak akses: kp.verifikasi-pendaftaran, kp.kelompok.view,
                //            kp.plotting-dosen, ta.verifikasi-judul,
                //            ta.plotting-dosen, repository.publish, repository.view
            ],
            [
                'name'     => 'Dosen Demo',
                'email'    => 'dosen@simkpta.test',
                'password' => 'password',
                'role'     => 'dosen',
                // Hak akses: kp.kelompok.view, kp.logbook.approve,
                //            kp.laporan.approve, kp.nilai.input,
                //            ta.bimbingan.approve, ta.nilai.input, repository.view
                // Catatan: berlaku hanya untuk kelompok/mahasiswa yang dibimbing
                //          (divalidasi di backend via Policy, bukan hanya permission)
            ],
            [
                'name'     => 'Mahasiswa Demo',
                'email'    => 'mahasiswa@simkpta.test',
                'password' => 'password',
                'role'     => 'mahasiswa',
                // Hak akses: kp.kelompok.create, kp.kelompok.view,
                //            kp.logbook.input, ta.pengajuan.create, repository.view
            ],
        ];

        foreach ($demoUsers as $data) {
            $user = User::updateOrCreate(
                ['email' => $data['email']],
                [
                    'name'              => $data['name'],
                    'password'          => Hash::make($data['password']),
                    'email_verified_at' => now(),
                ]
            );
            // syncRoles: ganti semua role lama, pastikan tepat satu role per user
            $user->syncRoles([$data['role']]);
        }

        // =====================================================================
        // LANGKAH 5 — Default Application Settings
        // (key-value, sesuai Blueprint bagian 6.2)
        // =====================================================================
        $defaults = [
            'app_name'                  => 'SIM-KPTA',
            'logo_path'                 => null,
            'favicon_path'              => null,
            'kp_jumlah_anggota_default' => '3',
        ];

        foreach ($defaults as $key => $value) {
            ApplicationSetting::updateOrCreate(
                ['key' => $key],
                ['value' => $value, 'type' => 'string']
            );
        }

        // Bersihkan cache sekali lagi setelah semua assignment selesai
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $this->command->info('RolePermissionSeeder selesai — 4 role, ' . count($allPermissions) . ' permission, 4 user demo.');
    }
}
