<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('tugas_akhir', function (Blueprint $table) {
            $table->id(); $table->foreignId('kelompok_kp_id')->constrained('kelompok_kp')->cascadeOnDelete();
            $table->string('judul'); $table->text('deskripsi')->nullable(); $table->string('status')->default('draft');
            $table->date('tanggal_mulai')->nullable(); $table->date('tanggal_selesai')->nullable(); $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('tugas_akhir'); }
};
