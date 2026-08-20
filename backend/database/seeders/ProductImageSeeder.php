<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Database\Seeder;

class ProductImageSeeder extends Seeder
{
    /**
     * Add primary demo images to products.
     */
    public function run(): void
    {
        $images = [
            'nova-wireless-headphones' =>
                'products/nova-wireless-headphones.jpg',

            'smart-fitness-watch' =>
                'products/smart-fitness-watch.jpg',

            'urban-everyday-sneakers' =>
                'products/urban-everyday-sneakers.jpg',

            'minimal-street-backpack' =>
                'products/minimal-street-backpack.jpg',

            'ambient-led-table-lamp' =>
                'products/ambient-led-table-lamp.jpg',

            'modern-desk-organizer' =>
                'products/modern-desk-organizer.jpg',

            'midnight-bloom-fragrance' =>
                'products/midnight-bloom-fragrance.jpg',

            'daily-skin-care-set' =>
                'products/daily-skin-care-set.jpg',

            'active-training-bag' =>
                'products/active-training-bag.jpg',

            'performance-water-bottle' =>
                'products/performance-water-bottle.jpg',
        ];

        foreach ($images as $productSlug => $imagePath) {
            $product = Product::where('slug', $productSlug)->first();

            if (!$product) {
                continue;
            }

            ProductImage::updateOrCreate(
                [
                    'product_id' => $product->id,
                    'is_primary' => true,
                ],
                [
                    'image' => $imagePath,
                    'alt_text' => $product->name,
                    'sort_order' => 1,
                ]
            );
        }
    }
}
