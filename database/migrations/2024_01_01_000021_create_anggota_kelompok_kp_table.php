<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('anggota_kelompok_kp', function (Blueprint $table) {
            $table->id(); $table->foreignId('kelompok_kp_id')->constrained('kelompok_kp')->cascadeOnDelete();
            $table->foreignId('mahasiswa_id')->constrained('mahasiswa')->cascadeOnDelete();
            $table->integer('urutan'); $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('anggota_kelompok_kp'); }
};
