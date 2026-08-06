<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('jadwal_ujian', function (Blueprint $table) {
            $table->id(); $table->foreignId('kelompok_kp_id')->constrained('kelompok_kp')->cascadeOnDelete();
            $table->foreignId('ruangan_id')->constrained('ruangan')->cascadeOnDelete();
            $table->dateTime('tanggal_ujian'); $table->string('status')->default('draft'); $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('jadwal_ujian'); }
};
