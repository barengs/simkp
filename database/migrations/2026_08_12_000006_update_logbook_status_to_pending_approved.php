<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement("SET SESSION sql_mode = REPLACE(@@sql_mode, 'STRICT_TRANS_TABLES', '')");
        }

        DB::table('logbook')->whereIn('status', ['draft', 'submitted', 'revision'])->update(['status' => 'pending']);

        Schema::table('logbook', function (Blueprint $table) {
            $table->enum('status', ['pending', 'approved'])->default('pending')->change();
            $table->dropColumn('rejection_note');
        });
    }

    public function down(): void
    {
        Schema::table('logbook', function (Blueprint $table) {
            $table->text('rejection_note')->nullable()->after('status');
            $table->enum('status', ['draft', 'submitted', 'approved', 'revision'])->default('draft')->change();
        });
    }
};
