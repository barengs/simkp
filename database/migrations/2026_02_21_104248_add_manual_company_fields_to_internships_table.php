<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('internships', function (Blueprint $table) {
            $table->text('company_address_manual')->nullable()->after('company_name_manual');
            $table->string('company_contact_manual')->nullable()->after('company_address_manual');
            $table->string('company_phone_manual')->nullable()->after('company_contact_manual');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('internships', function (Blueprint $table) {
            $table->dropColumn(['company_address_manual', 'company_contact_manual', 'company_phone_manual']);
        });
    }
};
