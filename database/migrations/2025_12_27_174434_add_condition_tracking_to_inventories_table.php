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
        Schema::table('inventories', function (Blueprint $table) {
            $table->text('condition_notes')->nullable()->after('condition');
            $table->timestamp('condition_changed_at')->nullable()->after('condition_notes');
            $table->string('drive_link')->nullable()->after('image_path');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('inventories', function (Blueprint $table) {
            $table->dropColumn(['condition_notes', 'condition_changed_at', 'drive_link']);
        });
    }
};
