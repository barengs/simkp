<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('registration_verification', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('student')->cascadeOnDelete();
            $table->foreignId('kp_group_id')->constrained('kp_group')->cascadeOnDelete();
            $table->string('status')->default('pending');
            $table->text('admin_notes')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('registration_verification');
    }
};
