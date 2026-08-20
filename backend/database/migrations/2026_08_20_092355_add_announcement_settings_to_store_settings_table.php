<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('store_settings', function (Blueprint $table) {
            $table
                ->boolean('announcement_enabled')
                ->default(true)
                ->after('free_shipping_threshold');

            $table
                ->string('announcement_text')
                ->default('Free delivery on orders over')
                ->after('announcement_enabled');
        });
    }

    public function down(): void
    {
        Schema::table('store_settings', function (Blueprint $table) {
            $table->dropColumn([
                'announcement_enabled',
                'announcement_text',
            ]);
        });
    }
};
