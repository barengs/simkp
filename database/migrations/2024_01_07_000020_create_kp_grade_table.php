<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kp_grade', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kp_group_member_id')->constrained('kp_group_member')->cascadeOnDelete();
            $table->foreignId('evaluation_criteria_id')->nullable()->constrained('evaluation_criteria')->nullOnDelete();
            $table->decimal('score_field', 5, 2)->nullable();
            $table->decimal('score_report', 5, 2)->nullable();
            $table->decimal('score_seminar', 5, 2)->nullable();
            $table->string('final_grade', 2)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kp_grade');
    }
};
