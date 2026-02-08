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
        Schema::create('internships', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete()->cascadeOnUpdate();
            $table->foreignId('period_id')->constrained()->cascadeOnDelete()->cascadeOnUpdate(); //tahun ajaran
            $table->foreignId('company_id')->constrained()->cascadeOnDelete()->cascadeOnUpdate(); //perusahaan
            $table->foreignId('theme_id')->constrained()->cascadeOnDelete()->cascadeOnUpdate(); //tema KP
            $table->foreignId('supervisor_id')->nullable()->constrained('lecturers')->cascadeOnDelete()->cascadeOnUpdate(); //dosen pembimbing
            $table->enum('status', ['draft', 'submitted', 'approved', 'rejected', 'ongoing', 'grading', 'finished'])->default('draft');
            $table->string('proposal_url');
            $table->string('krs_url');
            $table->string('ktp_url');
            $table->string('surat_rekomendasi_url')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('internships');
    }
};
