<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kp_group', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->foreignId('kp_company_id')->nullable()->constrained('kp_company')->nullOnDelete();
            $table->foreignId('kp_theme_id')->nullable()->constrained('kp_theme')->nullOnDelete();
            $table->foreignId('academic_period_id')->nullable()->constrained('academic_period')->nullOnDelete();
            $table->enum('status', [
                'draft', 'diajukan', 'ditolak', 'disetujui',
                'berjalan', 'laporan_masuk', 'revisi_laporan',
                'dinilai', 'selesai',
            ])->default('draft');
            $table->text('description')->nullable();
            $table->text('rejection_note')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kp_group');
    }
};
