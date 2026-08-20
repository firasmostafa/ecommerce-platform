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
        Schema::create('store_settings', function (Blueprint $table) {
            $table->id();

            // Store identity
            $table->string('store_name')->default('Nova Store');
            $table->text('store_description')->nullable();
            $table->string('logo')->nullable();
            $table->string('favicon')->nullable();

            // Dynamic store colors
            $table->string('primary_color')->default('#6C5CE7');
            $table->string('secondary_color')->default('#00D2FF');
            $table->string('accent_color')->default('#FF3CAC');
            $table->string('background_color')->default('#F8F9FF');

            // Contact information
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->text('address')->nullable();

            // Social media
            $table->string('facebook_url')->nullable();
            $table->string('instagram_url')->nullable();
            $table->string('whatsapp_number')->nullable();

            // Financial settings
            $table->string('currency_code', 3)->default('USD');
            $table->string('currency_symbol', 10)->default('$');

            $table->decimal('tax_rate', 5, 2)->default(0);
            $table->decimal('shipping_fee', 12, 2)->default(0);

            $table->decimal('free_shipping_threshold', 12, 2)
                ->nullable();

            // Store behavior
            $table->boolean('guest_checkout_enabled')->default(true);
            $table->boolean('tax_enabled')->default(false);

            // Invoice settings
            $table->string('invoice_prefix')->default('INV');
            $table->text('invoice_footer')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('store_settings');
    }
};
