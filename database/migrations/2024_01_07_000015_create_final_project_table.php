<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('final_project', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->foreignId('periode_id')->nullable()->constrained('academic_period')->nullOnDelete();
            $table->string('judul_disetujui')->nullable();
            $table->date('tanggal_pengajuan')->nullable();
            $table->text('catatan_penolakan')->nullable();
            $table->foreignId('mahasiswa_id')->constrained('student')->cascadeOnDelete();
            $table->string('status')->default('draft');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('final_project');
    }
};
