<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('laporan', function (Blueprint $table) {
            $table->id(); $table->foreignId('kelompok_kp_id')->constrained('kelompok_kp')->cascadeOnDelete();
            $table->morphs('laporable'); $table->string('nama_file'); $table->string('path_file');
            $table->text('catatan')->nullable(); $table->string('status')->default('draft'); $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('laporan'); }
};
