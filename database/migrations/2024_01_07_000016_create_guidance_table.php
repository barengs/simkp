<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('guidance', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('student')->cascadeOnDelete();
            $table->foreignId('lecturer_id')->nullable()->constrained('lecturer')->nullOnDelete();
            $table->text('notes');
            $table->string('type')->default('regular');
            $table->date('guidance_date')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('guidance');
    }
};
