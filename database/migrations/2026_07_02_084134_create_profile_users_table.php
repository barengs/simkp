<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('profile_users', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->onDelete('cascade');
            $table->enum('role', ['mahasiswa', 'dosen']);
            
            // Student fields
            $table->string('nim')->unique()->nullable();
            $table->string('major')->nullable();
            $table->string('batch_year')->nullable();
            
            // Lecturer fields
            $table->string('nip')->unique()->nullable();
            $table->string('jabatan_fungsional')->nullable();
            $table->integer('kuota_bimbingan')->default(5)->nullable();
            
            // Common fields
            $table->string('phone')->nullable();
            $table->foreignId('period_id')->nullable()->constrained('periods')->onDelete('set null');
            
            $table->timestamps();
        });

        // Copy existing data from students
        if (Schema::hasTable('students')) {
            $students = DB::table('students')->get();
            foreach ($students as $student) {
                // Check if user already has a profile to prevent duplicate entry errors
                $exists = DB::table('profile_users')->where('user_id', $student->user_id)->exists();
                if (!$exists) {
                    DB::table('profile_users')->insert([
                        'user_id' => $student->user_id,
                        'role' => 'mahasiswa',
                        'nim' => $student->nim,
                        'major' => $student->major,
                        'batch_year' => $student->batch_year,
                        'phone' => $student->phone,
                        'period_id' => $student->period_id,
                        'created_at' => $student->created_at,
                        'updated_at' => $student->updated_at,
                    ]);
                }
            }
        }

        // Copy existing data from lecturers
        if (Schema::hasTable('lecturers')) {
            $lecturers = DB::table('lecturers')->get();
            foreach ($lecturers as $lecturer) {
                $exists = DB::table('profile_users')->where('user_id', $lecturer->user_id)->exists();
                if (!$exists) {
                    DB::table('profile_users')->insert([
                        'user_id' => $lecturer->user_id,
                        'role' => 'dosen',
                        'nip' => $lecturer->nip,
                        'phone' => $lecturer->phone,
                        'period_id' => $lecturer->period_id,
                        'created_at' => $lecturer->created_at,
                        'updated_at' => $lecturer->updated_at,
                    ]);
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('profile_users');
    }
};
