<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bimbingan', function (Blueprint $table) {
            $table->id();
            $table->morphs('bimbingable');
            $table->foreignId('mahasiswa_id')->nullable()->constrained('student')->nullOnDelete();
            $table->foreignId('dosen_id')->nullable()->constrained('lecturer')->nullOnDelete();
            $table->date('tanggal')->nullable();
            $table->text('aktivitas')->nullable();
            $table->string('file')->nullable();
            $table->text('catatan_dosen')->nullable();
            $table->string('status')->default('pending');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bimbingan');
    }
};
