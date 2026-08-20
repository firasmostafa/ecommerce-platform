<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\HomeSetting;
use App\Models\Product;
use App\Models\StoreSetting;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class StoreDemoSeeder extends Seeder
{
    /**
     * Seed demo data for the customizable e-commerce store.
     */
    public function run(): void
    {
        DB::transaction(function () {
            /*
            |--------------------------------------------------------------------------
            | Store Settings
            |--------------------------------------------------------------------------
            */

            StoreSetting::updateOrCreate(
                ['id' => 1],
                [
                    'store_name' => 'Nova Store',

                    'store_description' =>
                        'A modern shopping destination for trending products, '
                        . 'exclusive deals, and everyday essentials.',

                    'logo' => null,
                    'favicon' => null,

                    'primary_color' => '#6C5CE7',
                    'secondary_color' => '#00D2FF',
                    'accent_color' => '#FF3CAC',
                    'background_color' => '#F8F9FF',

                    'email' => 'hello@novastore.test',
                    'phone' => '+961 00 000 000',
                    'address' => 'Lebanon',

                    'facebook_url' => null,
                    'instagram_url' => null,
                    'whatsapp_number' => null,

                    'currency_code' => 'USD',
                    'currency_symbol' => '$',

                    'tax_rate' => 0,
                    'shipping_fee' => 5,
                    'free_shipping_threshold' => 100,

                    'guest_checkout_enabled' => true,
                    'tax_enabled' => false,

                    'invoice_prefix' => 'INV',

                    'invoice_footer' =>
                        'Thank you for shopping with Nova Store!',
                ]
            );

            /*
            |--------------------------------------------------------------------------
            | Homepage Settings
            |--------------------------------------------------------------------------
            */

            HomeSetting::updateOrCreate(
                ['id' => 1],
                [
                    'hero_badge' => 'NEW SEASON • NEW ENERGY',

                    'hero_title' =>
                        'Discover Products That Match Your Lifestyle',

                    'hero_subtitle' =>
                        'Explore trending technology, fashion, beauty, '
                        . 'home essentials and more in one modern store.',

                    'hero_image' => null,

                    'hero_button_text' => 'Shop Now',
                    'hero_button_link' => '/products',

                    'secondary_button_text' => 'Explore Deals',
                    'secondary_button_link' => '/products?on_sale=1',

                    'show_categories' => true,
                    'show_featured_products' => true,
                    'show_new_arrivals' => true,
                    'show_special_offers' => true,
                    'show_promo_banner' => true,
                    'show_newsletter' => true,

                    'categories_title' => 'Explore Categories',
                    'featured_title' => 'Trending Right Now',
                    'new_arrivals_title' => 'Fresh Arrivals',
                    'offers_title' => 'Deals You Shouldn’t Miss',

                    'promo_badge' => 'LIMITED TIME',

                    'promo_title' => 'Upgrade Your Everyday',

                    'promo_description' =>
                        'Discover selected products at special prices '
                        . 'for a limited time.',

                    'promo_image' => null,

                    'promo_button_text' => 'View Offers',
                    'promo_button_link' => '/products?on_sale=1',

                    'newsletter_title' => 'Stay In The Loop',

                    'newsletter_description' =>
                        'Get new arrivals, special offers and store '
                        . 'updates delivered straight to your inbox.',
                ]
            );

            /*
            |--------------------------------------------------------------------------
            | Categories
            |--------------------------------------------------------------------------
            */

            $electronics = Category::updateOrCreate(
                ['slug' => 'electronics'],
                [
                    'name' => 'Electronics',
                    'description' =>
                        'Smart devices, accessories and modern technology.',
                    'image' => null,
                    'is_active' => true,
                    'sort_order' => 1,
                ]
            );

            $fashion = Category::updateOrCreate(
                ['slug' => 'fashion'],
                [
                    'name' => 'Fashion',
                    'description' =>
                        'Modern styles and everyday fashion essentials.',
                    'image' => null,
                    'is_active' => true,
                    'sort_order' => 2,
                ]
            );

            $home = Category::updateOrCreate(
                ['slug' => 'home-living'],
                [
                    'name' => 'Home & Living',
                    'description' =>
                        'Beautiful and practical products for your space.',
                    'image' => null,
                    'is_active' => true,
                    'sort_order' => 3,
                ]
            );

            $beauty = Category::updateOrCreate(
                ['slug' => 'beauty'],
                [
                    'name' => 'Beauty',
                    'description' =>
                        'Beauty, fragrance and personal care essentials.',
                    'image' => null,
                    'is_active' => true,
                    'sort_order' => 4,
                ]
            );

            $sports = Category::updateOrCreate(
                ['slug' => 'sports'],
                [
                    'name' => 'Sports',
                    'description' =>
                        'Fitness and active lifestyle products.',
                    'image' => null,
                    'is_active' => true,
                    'sort_order' => 5,
                ]
            );

            /*
            |--------------------------------------------------------------------------
            | Products
            |--------------------------------------------------------------------------
            */

            $products = [
                [
                    'category_id' => $electronics->id,
                    'name' => 'Nova Wireless Headphones',
                    'slug' => 'nova-wireless-headphones',
                    'sku' => 'ELEC-001',
                    'short_description' =>
                        'Immersive wireless audio with a sleek modern design.',
                    'description' =>
                        'Comfortable wireless headphones designed for music, '
                        . 'work and everyday entertainment.',
                    'price' => 129.99,
                    'sale_price' => 99.99,
                    'stock' => 24,
                    'is_featured' => true,
                    'is_active' => true,
                    'sort_order' => 1,
                ],
                [
                    'category_id' => $electronics->id,
                    'name' => 'Smart Fitness Watch',
                    'slug' => 'smart-fitness-watch',
                    'sku' => 'ELEC-002',
                    'short_description' =>
                        'Track your day with a bright and modern smartwatch.',
                    'description' =>
                        'A lightweight smartwatch for activity tracking, '
                        . 'notifications and everyday fitness.',
                    'price' => 179.00,
                    'sale_price' => 149.00,
                    'stock' => 15,
                    'is_featured' => true,
                    'is_active' => true,
                    'sort_order' => 2,
                ],
                [
                    'category_id' => $fashion->id,
                    'name' => 'Urban Everyday Sneakers',
                    'slug' => 'urban-everyday-sneakers',
                    'sku' => 'FASH-001',
                    'short_description' =>
                        'Clean everyday sneakers built for comfort and style.',
                    'description' =>
                        'Versatile sneakers with a modern silhouette for '
                        . 'casual outfits and everyday wear.',
                    'price' => 89.99,
                    'sale_price' => null,
                    'stock' => 32,
                    'is_featured' => true,
                    'is_active' => true,
                    'sort_order' => 3,
                ],
                [
                    'category_id' => $fashion->id,
                    'name' => 'Minimal Street Backpack',
                    'slug' => 'minimal-street-backpack',
                    'sku' => 'FASH-002',
                    'short_description' =>
                        'A practical backpack with a clean urban look.',
                    'description' =>
                        'Designed for daily essentials, laptops and '
                        . 'comfortable everyday carrying.',
                    'price' => 64.99,
                    'sale_price' => 49.99,
                    'stock' => 18,
                    'is_featured' => false,
                    'is_active' => true,
                    'sort_order' => 4,
                ],
                [
                    'category_id' => $home->id,
                    'name' => 'Ambient LED Table Lamp',
                    'slug' => 'ambient-led-table-lamp',
                    'sku' => 'HOME-001',
                    'short_description' =>
                        'Soft ambient lighting for modern rooms and desks.',
                    'description' =>
                        'A compact decorative LED lamp designed to add '
                        . 'warmth and personality to your space.',
                    'price' => 54.99,
                    'sale_price' => 44.99,
                    'stock' => 11,
                    'is_featured' => true,
                    'is_active' => true,
                    'sort_order' => 5,
                ],
                [
                    'category_id' => $home->id,
                    'name' => 'Modern Desk Organizer',
                    'slug' => 'modern-desk-organizer',
                    'sku' => 'HOME-002',
                    'short_description' =>
                        'Keep your workspace clean, simple and organized.',
                    'description' =>
                        'A practical organizer for accessories, stationery '
                        . 'and everyday desk essentials.',
                    'price' => 34.99,
                    'sale_price' => null,
                    'stock' => 40,
                    'is_featured' => false,
                    'is_active' => true,
                    'sort_order' => 6,
                ],
                [
                    'category_id' => $beauty->id,
                    'name' => 'Midnight Bloom Fragrance',
                    'slug' => 'midnight-bloom-fragrance',
                    'sku' => 'BEAU-001',
                    'short_description' =>
                        'A modern fragrance with a rich and elegant character.',
                    'description' =>
                        'A balanced fragrance created for evening occasions '
                        . 'and memorable everyday moments.',
                    'price' => 79.99,
                    'sale_price' => 64.99,
                    'stock' => 20,
                    'is_featured' => true,
                    'is_active' => true,
                    'sort_order' => 7,
                ],
                [
                    'category_id' => $beauty->id,
                    'name' => 'Daily Skin Care Set',
                    'slug' => 'daily-skin-care-set',
                    'sku' => 'BEAU-002',
                    'short_description' =>
                        'A simple daily care collection for your routine.',
                    'description' =>
                        'A convenient set designed to support a clean and '
                        . 'consistent everyday skin care routine.',
                    'price' => 59.99,
                    'sale_price' => null,
                    'stock' => 27,
                    'is_featured' => false,
                    'is_active' => true,
                    'sort_order' => 8,
                ],
                [
                    'category_id' => $sports->id,
                    'name' => 'Active Training Bag',
                    'slug' => 'active-training-bag',
                    'sku' => 'SPRT-001',
                    'short_description' =>
                        'A spacious training bag for gym and active days.',
                    'description' =>
                        'Built for clothing, shoes and training essentials '
                        . 'with a practical everyday design.',
                    'price' => 69.99,
                    'sale_price' => 54.99,
                    'stock' => 14,
                    'is_featured' => true,
                    'is_active' => true,
                    'sort_order' => 9,
                ],
                [
                    'category_id' => $sports->id,
                    'name' => 'Performance Water Bottle',
                    'slug' => 'performance-water-bottle',
                    'sku' => 'SPRT-002',
                    'short_description' =>
                        'A lightweight reusable bottle for active lifestyles.',
                    'description' =>
                        'Designed for training, travel and everyday hydration.',
                    'price' => 24.99,
                    'sale_price' => 19.99,
                    'stock' => 50,
                    'is_featured' => false,
                    'is_active' => true,
                    'sort_order' => 10,
                ],
            ];

            foreach ($products as $product) {
                Product::updateOrCreate(
                    ['slug' => $product['slug']],
                    $product
                );
            }
        });
    }
}
