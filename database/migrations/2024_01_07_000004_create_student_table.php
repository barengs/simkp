<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('nim')->unique();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('nik')->nullable()->unique();
            $table->string('phone_number')->nullable();
            $table->date('birth_date')->nullable();
            $table->string('gender')->nullable();
            $table->text('address')->nullable();
            $table->date('graduation_date')->nullable();
            $table->string('status')->default('active');
            $table->string('parent_phone_number')->nullable();
            $table->foreignId('study_program_id')->constrained('study_program')->cascadeOnDelete();
            $table->foreignId('lecturer_id')->nullable()->constrained('lecturer')->nullOnDelete();
            $table->string('profile_picture_url')->nullable();
            $table->softDeletes();
            $table->timestamps();
            $table->index('nim');
            $table->index('email');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student');
    }
};
