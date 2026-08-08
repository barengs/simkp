<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kp_document', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->foreignId('document_type_id')->nullable()->constrained('document_type')->nullOnDelete();
            $table->foreignId('kp_group_id')->nullable()->constrained('kp_group')->nullOnDelete();
            $table->foreignId('student_id')->nullable()->constrained('student')->nullOnDelete();
            $table->string('file_url')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->string('status')->default('draft');
            $table->text('remarks')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kp_document');
    }
};
