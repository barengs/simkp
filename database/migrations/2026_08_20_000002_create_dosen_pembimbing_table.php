<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dosen_pembimbing', function (Blueprint $table) {
            $table->id();
            $table->morphs('pembimbingable');
            $table->foreignId('dosen_id')->constrained('lecturer')->cascadeOnDelete();
            $table->string('peran');
            $table->boolean('status_acc_ujian')->default(false);
            $table->boolean('status_acc_revisi')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dosen_pembimbing');
    }
};
