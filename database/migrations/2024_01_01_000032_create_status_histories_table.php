<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('status_histories', function (Blueprint $table) {
            $table->id(); $table->morphs('statusable'); $table->string('status'); $table->text('catatan')->nullable();
            $table->foreignId('changed_by')->nullable()->constrained('users')->nullOnDelete(); $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('status_histories'); }
};
