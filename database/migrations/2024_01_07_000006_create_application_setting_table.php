<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('application_setting', function (Blueprint $table) {
            $table->id();
            $table->string('app_name');
            $table->string('app_title')->nullable();
            $table->string('app_logo_url')->nullable();
            $table->string('primary_color')->default('#10b981');
            $table->string('secondary_color')->default('#059669');
            $table->string('default_language')->default('id');
            $table->string('timezone')->default('Asia/Jakarta');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('application_setting');
    }
};
