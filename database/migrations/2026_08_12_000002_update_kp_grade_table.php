<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('kp_grade', function (Blueprint $table) {
            $table->dropColumn(['score', 'feedback']);
            $table->decimal('score_field', 5, 2)->nullable()->after('evaluation_criteria_id');
            $table->decimal('score_report', 5, 2)->nullable()->after('score_field');
            $table->decimal('score_seminar', 5, 2)->nullable()->after('score_report');
            $table->string('final_grade', 2)->nullable()->after('score_seminar');
            $table->text('notes')->nullable()->after('final_grade');
        });
    }

    public function down(): void
    {
        Schema::table('kp_grade', function (Blueprint $table) {
            $table->dropColumn(['score_field', 'score_report', 'score_seminar', 'final_grade', 'notes']);
            $table->decimal('score', 5, 2)->default(0)->after('evaluation_criteria_id');
            $table->text('feedback')->nullable()->after('score');
        });
    }
};
