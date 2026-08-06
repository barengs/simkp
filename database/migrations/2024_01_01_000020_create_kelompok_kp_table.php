<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('kelompok_kp', function (Blueprint $table) {
            $table->id(); $table->string('kode_kelompok')->unique(); $table->string('nama_kelompok');
            $table->foreignId('program_studi_id')->constrained('program_studi')->cascadeOnDelete();
            $table->foreignId('periode_akademik_id')->constrained('periode_akademik')->cascadeOnDelete();
            $table->foreignId('tema_kp_id')->constrained('tema_kp')->cascadeOnDelete();
            $table->foreignId('perusahaan_kp_id')->constrained('perusahaan_kp')->cascadeOnDelete();
            $table->foreignId('dosen_pembimbing_id')->nullable()->constrained('dosen')->nullOnDelete();
            $table->foreignId('dosen_penguji_id')->nullable()->constrained('dosen')->nullOnDelete();
            $table->integer('jumlah_anggota'); $table->string('status')->default('draft'); $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('kelompok_kp'); }
};
