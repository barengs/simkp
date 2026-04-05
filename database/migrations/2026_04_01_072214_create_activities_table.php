<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('period_id')->nullable()->constrained()->onDelete('set null');
            $table->string('type'); // type e.g., 'registration_submitted', 'logbook_approved'
            $table->text('description');
            $table->json('properties')->nullable(); // extra data
            $table->timestamps();

            // Indexes for fast lookup on dashboard/list
            $table->index(['user_id', 'created_at']);
            $table->index(['period_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activities');
    }
};
