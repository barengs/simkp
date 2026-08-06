<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('dokumen_kp', function (Blueprint $table) {
            $table->id(); $table->foreignId('kelompok_kp_id')->constrained('kelompok_kp')->cascadeOnDelete();
            $table->foreignId('jenis_dokumen_kp_id')->constrained('jenis_dokumen_kp')->cascadeOnDelete();
            $table->string('nama_file'); $table->string('path_file'); $table->text('catatan')->nullable();
            $table->string('status')->default('draft'); $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('dokumen_kp'); }
};
