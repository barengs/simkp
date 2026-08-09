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
        Schema::table('kp_group', function (Blueprint $table) {
            // Catatan penolakan dari koordinator/admin saat status = 'ditolak'
            // Sesuai Blueprint bagian 7.2: kolom catatan_penolakan di kelompok_kp
            $table->text('rejection_note')->nullable()->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('kp_group', function (Blueprint $table) {
            $table->dropColumn('rejection_note');
        });
    }
};
