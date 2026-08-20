<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StoreSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'store_name',
        'store_description',
        'logo',
        'favicon',

        'primary_color',
        'secondary_color',
        'accent_color',
        'background_color',

        'email',
        'phone',
        'address',

        'facebook_url',
        'instagram_url',
        'whatsapp_number',

        'currency_code',
        'currency_symbol',

        'tax_rate',
        'shipping_fee',
        'free_shipping_threshold',

        'announcement_enabled',
        'announcement_text',

        'guest_checkout_enabled',
        'tax_enabled',

        'invoice_prefix',
        'invoice_footer',
    ];

    protected $casts = [
        'tax_rate' => 'decimal:2',
        'shipping_fee' => 'decimal:2',
        'free_shipping_threshold' => 'decimal:2',

        'announcement_enabled' => 'boolean',

        'guest_checkout_enabled' => 'boolean',
        'tax_enabled' => 'boolean',
    ];
}
