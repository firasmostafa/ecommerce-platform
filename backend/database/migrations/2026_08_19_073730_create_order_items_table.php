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
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();

            // The order/invoice this item belongs to
            $table->foreignId('order_id')
                ->constrained()
                ->cascadeOnDelete();

            // Keep nullable so historical invoices survive
            // even if a product is deleted later.
            $table->foreignId('product_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            // Snapshot of product information at purchase time
            $table->string('product_name');
            $table->string('product_sku')->nullable();

            // Price for one unit at purchase time
            $table->decimal('unit_price', 12, 2);

            // Quantity purchased
            $table->unsignedInteger('quantity');

            // Optional discount applied to this line
            $table->decimal('discount_amount', 12, 2)->default(0);

            // Final total for this line
            $table->decimal('line_total', 12, 2);

            $table->timestamps();

            $table->index('order_id');
            $table->index('product_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};
