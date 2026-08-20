<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HomeSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'hero_badge',
        'hero_title',
        'hero_subtitle',
        'hero_image',
        'hero_button_text',
        'hero_button_link',
        'secondary_button_text',
        'secondary_button_link',

        'show_categories',
        'show_featured_products',
        'show_new_arrivals',
        'show_special_offers',
        'show_promo_banner',
        'show_newsletter',

        'categories_title',
        'categories_subtitle',

        'featured_title',
        'featured_subtitle',

        'new_arrivals_title',
        'offers_title',

        'promo_badge',
        'promo_title',
        'promo_description',
        'promo_image',
        'promo_button_text',
        'promo_button_link',

        'newsletter_title',
        'newsletter_description',
    ];

    protected $casts = [
        'show_categories' => 'boolean',
        'show_featured_products' => 'boolean',
        'show_new_arrivals' => 'boolean',
        'show_special_offers' => 'boolean',
        'show_promo_banner' => 'boolean',
        'show_newsletter' => 'boolean',
    ];
}
