<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('logbooks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('internship_id')->constrained()->cascadeOnDelete();
            $table->date('date');
            $table->text('activity');
            $table->string('evidence_photo')->nullable();
            $table->enum('status', ['pending', 'approved'])->default('pending');
            $table->timestamps();

            $table->index('internship_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('logbooks');
    }
};
