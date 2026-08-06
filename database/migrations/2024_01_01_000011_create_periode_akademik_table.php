<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('periode_akademik', function (Blueprint $table) {
            $table->id(); $table->string('nama_periode'); $table->string('semester');
            $table->date('tanggal_mulai'); $table->date('tanggal_selesai');
            $table->integer('jumlah_anggota_kp')->default(3); $table->boolean('is_active')->default(false);
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('periode_akademik'); }
};
