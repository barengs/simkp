<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('logbook', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('student')->cascadeOnDelete();
            $table->foreignId('kp_group_id')->nullable()->constrained('kp_group')->nullOnDelete();
            $table->date('activity_date');
            $table->string('title')->nullable();
            $table->text('activity');
            $table->text('note')->nullable();
            $table->string('status')->default('draft');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('logbook');
    }
};
