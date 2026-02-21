<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('internships', function (Blueprint $table) {
            $table->id();
            $table->foreignId('leader_id')->constrained('students')->cascadeOnDelete()->cascadeOnUpdate();
            $table->foreignId('period_id')->constrained()->cascadeOnDelete()->cascadeOnUpdate(); //tahun ajaran
            $table->foreignId('company_id')->nullable()->constrained()->cascadeOnDelete()->cascadeOnUpdate(); //perusahaan
            $table->string('company_name_manual')->nullable(); // Nama perusahaan manual
            $table->foreignId('theme_id')->constrained()->cascadeOnDelete()->cascadeOnUpdate(); //tema KP
            $table->foreignId('supervisor_id')->nullable()->constrained('lecturers')->cascadeOnDelete()->cascadeOnUpdate(); //dosen pembimbing
            $table->enum('status', ['draft', 'submitted', 'approved', 'rejected', 'ongoing', 'grading', 'finished'])->default('draft');
            $table->text('rejection_note')->nullable(); // Catatan penolakan
            $table->string('proposal_url')->nullable();
            $table->string('krs_url')->nullable();
            $table->string('ktp_url')->nullable();
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
