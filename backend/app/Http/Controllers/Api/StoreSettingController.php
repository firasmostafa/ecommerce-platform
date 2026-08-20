<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StoreSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class StoreSettingController extends Controller
{
    /**
     * Return the public store settings.
     */
    public function show(): JsonResponse
    {
        $settings = StoreSetting::first();

        if (!$settings) {
            return response()->json([
                'success' => false,
                'message' => 'Store settings were not found.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $settings,
        ]);
    }

    /**
     * Update store settings.
     */
    public function update(Request $request): JsonResponse
    {
        $settings = StoreSetting::first();

        if (!$settings) {
            $settings = new StoreSetting();
        }

        $validated = $request->validate([
            'store_name' => [
                'sometimes',
                'required',
                'string',
                'max:255',
            ],

            'store_description' => [
                'nullable',
                'string',
            ],

            /*
            |--------------------------------------------------------------------------
            | Branding
            |--------------------------------------------------------------------------
            */

            'logo' => [
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:4096',
            ],

            'favicon' => [
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp,ico',
                'max:2048',
            ],

            /*
            |--------------------------------------------------------------------------
            | Colors
            |--------------------------------------------------------------------------
            */

            'primary_color' => [
                'sometimes',
                'required',
                'regex:/^#[0-9A-Fa-f]{6}$/',
            ],

            'secondary_color' => [
                'sometimes',
                'required',
                'regex:/^#[0-9A-Fa-f]{6}$/',
            ],

            'accent_color' => [
                'sometimes',
                'required',
                'regex:/^#[0-9A-Fa-f]{6}$/',
            ],

            'background_color' => [
                'sometimes',
                'required',
                'regex:/^#[0-9A-Fa-f]{6}$/',
            ],

            /*
            |--------------------------------------------------------------------------
            | Contact
            |--------------------------------------------------------------------------
            */

            'email' => [
                'nullable',
                'email',
                'max:255',
            ],

            'phone' => [
                'nullable',
                'string',
                'max:50',
            ],

            'address' => [
                'nullable',
                'string',
            ],

            /*
            |--------------------------------------------------------------------------
            | Social Media
            |--------------------------------------------------------------------------
            */

            'facebook_url' => [
                'nullable',
                'url',
                'max:2048',
            ],

            'instagram_url' => [
                'nullable',
                'url',
                'max:2048',
            ],

            'whatsapp_number' => [
                'nullable',
                'string',
                'max:50',
            ],

            /*
            |--------------------------------------------------------------------------
            | Currency
            |--------------------------------------------------------------------------
            */

            'currency_code' => [
                'sometimes',
                'required',
                'string',
                'size:3',
            ],

            'currency_symbol' => [
                'sometimes',
                'required',
                'string',
                'max:10',
            ],

            /*
            |--------------------------------------------------------------------------
            | Tax + Shipping
            |--------------------------------------------------------------------------
            */

            'tax_rate' => [
                'sometimes',
                'numeric',
                'min:0',
                'max:100',
            ],

            'shipping_fee' => [
                'sometimes',
                'numeric',
                'min:0',
            ],

            'free_shipping_threshold' => [
                'nullable',
                'numeric',
                'min:0',
            ],

            /*
            |--------------------------------------------------------------------------
            | Announcement
            |--------------------------------------------------------------------------
            */

            'announcement_enabled' => [
                'sometimes',
                'boolean',
            ],

            'announcement_text' => [
                'nullable',
                'string',
                'max:255',
            ],

            /*
            |--------------------------------------------------------------------------
            | Store Behaviour
            |--------------------------------------------------------------------------
            */

            'guest_checkout_enabled' => [
                'sometimes',
                'boolean',
            ],

            'tax_enabled' => [
                'sometimes',
                'boolean',
            ],

            /*
            |--------------------------------------------------------------------------
            | Invoice
            |--------------------------------------------------------------------------
            */

            'invoice_prefix' => [
                'sometimes',
                'required',
                'string',
                'max:20',
            ],

            'invoice_footer' => [
                'nullable',
                'string',
            ],
        ]);

        /*
        |--------------------------------------------------------------------------
        | Logo Upload
        |--------------------------------------------------------------------------
        */

        if ($request->hasFile('logo')) {
            if (
                $settings->logo &&
                Storage::disk('public')->exists($settings->logo)
            ) {
                Storage::disk('public')->delete($settings->logo);
            }

            $validated['logo'] =
                $request
                    ->file('logo')
                    ->store('store/logos', 'public');
        }

        /*
        |--------------------------------------------------------------------------
        | Favicon Upload
        |--------------------------------------------------------------------------
        */

        if ($request->hasFile('favicon')) {
            if (
                $settings->favicon &&
                Storage::disk('public')->exists($settings->favicon)
            ) {
                Storage::disk('public')->delete($settings->favicon);
            }

            $validated['favicon'] =
                $request
                    ->file('favicon')
                    ->store('store/favicons', 'public');
        }

        $settings->fill($validated);

        $settings->save();

        return response()->json([
            'success' => true,
            'message' => 'Store settings updated successfully.',
            'data' => $settings,
        ]);
    }
}
