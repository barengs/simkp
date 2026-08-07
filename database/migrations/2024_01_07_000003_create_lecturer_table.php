<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lecturer', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('nip')->unique();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('phone_number')->nullable();
            $table->date('birth_date')->nullable();
            $table->string('gender')->nullable();
            $table->string('nidn')->nullable()->unique();
            $table->text('address')->nullable();
            $table->string('office_address')->nullable();
            $table->string('position')->nullable();
            $table->string('expertise')->nullable();
            $table->string('profile_picture_url')->nullable();
            $table->foreignId('study_program_id')->constrained('study_program')->cascadeOnDelete();
            $table->softDeletes();
            $table->timestamps();
            $table->index('nip');
            $table->index('nidn');
            $table->index('email');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lecturer');
    }
};
