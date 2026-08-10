<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kp_group_member', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kp_group_id')->constrained('kp_group')->cascadeOnDelete();
            $table->foreignId('student_id')->constrained('student')->cascadeOnDelete();
            $table->string('role')->nullable();
            $table->date('join_date')->nullable();
            $table->date('leave_date')->nullable();
            $table->string('status')->default('active');
            $table->foreignId('supervisor_lecturer_id')->nullable()->constrained('lecturer')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kp_group_member');
    }
};
