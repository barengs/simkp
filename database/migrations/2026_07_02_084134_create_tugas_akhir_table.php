<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tugas_akhir', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('internship_id')->nullable()->constrained('internships')->onDelete('set null');
            
            $table->string('judul_diajukan');
            $table->string('judul_disetujui')->nullable();
            $table->text('latar_belakang_singkat');
            
            $table->foreignId('pembimbing_1_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('pembimbing_2_id')->nullable()->constrained('users')->onDelete('set null');
            
            $table->enum('status', ['pengajuan', 'revisi_judul', 'bimbingan', 'daftar_sidang', 'revisi_sidang', 'lulus', 'batal'])->default('pengajuan');
            $table->text('rejection_note')->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tugas_akhir');
    }
};
