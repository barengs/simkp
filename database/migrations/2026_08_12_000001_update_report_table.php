<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('report', function (Blueprint $table) {
            $table->dropColumn(['title', 'content', 'report_date']);
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending')->change();
            $table->text('rejection_note')->nullable()->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('report', function (Blueprint $table) {
            $table->string('title')->after('id');
            $table->text('content')->nullable()->after('title');
            $table->date('report_date')->nullable()->after('student_id');
            $table->string('status')->default('draft')->change();
            $table->dropColumn('rejection_note');
        });
    }
};
