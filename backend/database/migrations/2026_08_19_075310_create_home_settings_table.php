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
        Schema::create('home_settings', function (Blueprint $table) {
            $table->id();

            // Hero section
            $table->string('hero_badge')->nullable();
            $table->string('hero_title')->default('Discover Something Amazing');
            $table->text('hero_subtitle')->nullable();
            $table->string('hero_image')->nullable();

            $table->string('hero_button_text')->default('Shop Now');
            $table->string('hero_button_link')->default('/products');

            // Optional secondary action
            $table->string('secondary_button_text')->nullable();
            $table->string('secondary_button_link')->nullable();

            // Homepage sections visibility
            $table->boolean('show_categories')->default(true);
            $table->boolean('show_featured_products')->default(true);
            $table->boolean('show_new_arrivals')->default(true);
            $table->boolean('show_special_offers')->default(true);
            $table->boolean('show_promo_banner')->default(true);
            $table->boolean('show_newsletter')->default(true);

            // Section headings
            $table->string('categories_title')->default('Shop by Category');
            $table->string('featured_title')->default('Featured Products');
            $table->string('new_arrivals_title')->default('New Arrivals');
            $table->string('offers_title')->default('Special Offers');

            // Promotional banner
            $table->string('promo_badge')->nullable();
            $table->string('promo_title')->nullable();
            $table->text('promo_description')->nullable();
            $table->string('promo_image')->nullable();
            $table->string('promo_button_text')->nullable();
            $table->string('promo_button_link')->nullable();

            // Newsletter
            $table->string('newsletter_title')
                ->default('Join Our Community');

            $table->text('newsletter_description')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('home_settings');
    }
};
