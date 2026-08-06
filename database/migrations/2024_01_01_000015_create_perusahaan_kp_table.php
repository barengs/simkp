<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('perusahaan_kp', function (Blueprint $table) {
            $table->id(); $table->string('nama_perusahaan'); $table->string('alamat');
            $table->string('no_telp')->nullable(); $table->string('email')->nullable();
            $table->string('nama_pic')->nullable(); $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('perusahaan_kp'); }
};
