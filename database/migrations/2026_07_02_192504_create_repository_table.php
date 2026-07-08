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
        Schema::create('repository', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tugas_akhir_id')->unique()->constrained('tugas_akhir')->onDelete('cascade');
            $table->text('abstrak_id');
            $table->text('abstrak_en');
            $table->string('kata_kunci');
            $table->string('file_pdf_full');
            $table->string('file_jurnal')->nullable();
            $table->string('file_source_code')->nullable();
            $table->boolean('is_public')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('repository');
    }
};
