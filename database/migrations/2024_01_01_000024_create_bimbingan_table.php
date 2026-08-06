<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('bimbingan', function (Blueprint $table) {
            $table->id(); $table->foreignId('dosen_id')->constrained('dosen')->cascadeOnDelete();
            $table->morphs('bimbable'); $table->text('catatan')->nullable();
            $table->string('status')->default('draft'); $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('bimbingan'); }
};
