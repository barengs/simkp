<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Expand users.role enum and migrate legacy "dosen" values.
     */
    public function up(): void
    {
        // MySQL enum alteration - expand enum to include new role names
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'dosen', 'dosen_pembimbing', 'dosen_penguji', 'koordinator_ta', 'mahasiswa') NOT NULL DEFAULT 'mahasiswa'");

        // Migrate existing 'dosen' values to 'dosen_pembimbing'
        DB::table('users')->where('role', 'dosen')->update(['role' => 'dosen_pembimbing']);

        // Drop legacy 'dosen' value from enum after data migration
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'dosen_pembimbing', 'dosen_penguji', 'koordinator_ta', 'mahasiswa') NOT NULL DEFAULT 'mahasiswa'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'dosen', 'dosen_pembimbing', 'dosen_penguji', 'koordinator_ta', 'mahasiswa') NOT NULL DEFAULT 'mahasiswa'");

        DB::table('users')
            ->whereIn('role', ['dosen_pembimbing', 'dosen_penguji', 'koordinator_ta'])
            ->update(['role' => 'dosen']);

        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'dosen', 'mahasiswa') NOT NULL DEFAULT 'mahasiswa'");
    }
};
