<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('repository', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('file_url')->nullable();
            $table->string('file_type')->nullable();
            $table->foreignId('student_id')->nullable()->constrained('student')->nullOnDelete();
            $table->foreignId('lecturer_id')->nullable()->constrained('lecturer')->nullOnDelete();
            $table->timestamp('uploaded_at')->nullable();
            $table->string('status')->default('public');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('repository');
    }
};
