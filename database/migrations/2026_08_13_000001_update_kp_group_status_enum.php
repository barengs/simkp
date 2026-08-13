<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('kp_group', function (Blueprint $table) {
            $table->enum('status', [
                'draft', 'submitted', 'approved', 'rejected',
                'ongoing', 'grading', 'finished',
            ])->default('draft')->change();
        });
    }

    public function down(): void
    {
        Schema::table('kp_group', function (Blueprint $table) {
            $table->enum('status', [
                'draft', 'diajukan', 'ditolak', 'disetujui',
                'berjalan', 'laporan_masuk', 'revisi_laporan',
                'dinilai', 'selesai',
            ])->default('draft')->change();
        });
    }
};
