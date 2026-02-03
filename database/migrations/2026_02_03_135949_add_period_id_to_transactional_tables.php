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
        // Get active period or first period as default for existing data
        $defaultPeriodId = DB::table('periods')->where('is_active', true)->value('id') 
                          ?? DB::table('periods')->value('id');

        Schema::table('students', function (Blueprint $table) use ($defaultPeriodId) {
            $table->foreignId('period_id')->after('user_id')->nullable()->constrained('periods')->onDelete('cascade');
            // Drop old unique constraint
            $table->dropUnique(['nim']);
            // Add composite unique constraint
            $table->unique(['nim', 'period_id']);
        });

        Schema::table('lecturers', function (Blueprint $table) use ($defaultPeriodId) {
            $table->foreignId('period_id')->after('user_id')->nullable()->constrained('periods')->onDelete('cascade');
            // Drop old unique constraint
            $table->dropUnique(['nip']);
            // Add composite unique constraint
            $table->unique(['nip', 'period_id']);
        });

        // Set default period for existing records
        if ($defaultPeriodId) {
            DB::table('students')->update(['period_id' => $defaultPeriodId]);
            DB::table('lecturers')->update(['period_id' => $defaultPeriodId]);
        }

        // Make period_id non-nullable after filling data
        Schema::table('students', function (Blueprint $table) {
            $table->unsignedBigInteger('period_id')->nullable(false)->change();
        });
        Schema::table('lecturers', function (Blueprint $table) {
            $table->unsignedBigInteger('period_id')->nullable(false)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropUnique(['nim', 'period_id']);
            $table->unique('nim');
            $table->dropConstrainedForeignId('period_id');
        });

        Schema::table('lecturers', function (Blueprint $table) {
            $table->dropUnique(['nip', 'period_id']);
            $table->unique('nip');
            $table->dropConstrainedForeignId('period_id');
        });
    }
};
