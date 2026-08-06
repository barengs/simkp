<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('nilai_kp', function (Blueprint $table) {
            $table->id(); $table->foreignId('kelompok_kp_id')->constrained('kelompok_kp')->cascadeOnDelete();
            $table->foreignId('dosen_id')->constrained('dosen')->cascadeOnDelete();
            $table->decimal('nilai_angka', 5, 2)->nullable(); $table->string('nilai_huruf')->nullable();
            $table->text('catatan')->nullable(); $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('nilai_kp'); }
};
