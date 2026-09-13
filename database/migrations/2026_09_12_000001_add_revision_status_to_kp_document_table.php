<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Add new enum value 'revision' to status column
        DB::statement("ALTER TABLE kp_document MODIFY COLUMN status ENUM('draft','submitted','approved','rejected','revision') DEFAULT 'draft'");
    }

    public function down(): void
    {
        // Revert to original enum, change any rows that are already in 'revision' back to 'rejected'
        DB::table('kp_document')->where('status', 'revision')->update(['status' => 'rejected']);
        DB::statement("ALTER TABLE kp_document MODIFY COLUMN status ENUM('draft','submitted','approved','rejected') DEFAULT 'draft'");
    }
};
