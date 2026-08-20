<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategoryImageSeeder extends Seeder
{
    /**
     * Add demo images to the store categories.
     */
    public function run(): void
    {
        $categories = [
            'electronics' => 'categories/electronics.jpg',
            'fashion' => 'categories/fashion.jpg',
            'home-living' => 'categories/home-living.jpg',
            'beauty' => 'categories/beauty.jpg',
            'sports' => 'categories/sports.jpg',
        ];

        foreach ($categories as $slug => $image) {
            Category::where('slug', $slug)->update([
                'image' => $image,
            ]);
        }
    }
}
