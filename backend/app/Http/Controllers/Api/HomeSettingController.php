<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HomeSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class HomeSettingController extends Controller
{
    /**
     * Return homepage settings for the storefront.
     */
    public function show(): JsonResponse
    {
        $settings = Cache::remember(
            'homepage_settings',
            now()->addMinutes(10),
            function () {
                return HomeSetting::first();
            }
        );

        if (!$settings) {
            return response()->json([
                'success' => false,
                'message' => 'Homepage settings were not found.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $settings,
        ]);
    }

    /**
     * Update homepage settings.
     */
    public function update(Request $request): JsonResponse
    {
        $settings = HomeSetting::first();

        if (!$settings) {
            $settings = new HomeSetting();
        }

        $validated = $request->validate([
            'hero_badge' => [
                'nullable',
                'string',
                'max:255',
            ],

            'hero_title' => [
                'sometimes',
                'required',
                'string',
                'max:255',
            ],

            'hero_subtitle' => [
                'nullable',
                'string',
            ],

            'hero_image' => [
                'nullable',
                'string',
                'max:2048',
            ],

            'hero_button_text' => [
                'sometimes',
                'required',
                'string',
                'max:100',
            ],

            'hero_button_link' => [
                'sometimes',
                'required',
                'string',
                'max:2048',
            ],

            'secondary_button_text' => [
                'nullable',
                'string',
                'max:100',
            ],

            'secondary_button_link' => [
                'nullable',
                'string',
                'max:2048',
            ],

            /*
            |--------------------------------------------------------------------------
            | Homepage visibility
            |--------------------------------------------------------------------------
            */

            'show_categories' => [
                'sometimes',
                'boolean',
            ],

            'show_featured_products' => [
                'sometimes',
                'boolean',
            ],

            'show_new_arrivals' => [
                'sometimes',
                'boolean',
            ],

            'show_special_offers' => [
                'sometimes',
                'boolean',
            ],

            'show_promo_banner' => [
                'sometimes',
                'boolean',
            ],

            'show_newsletter' => [
                'sometimes',
                'boolean',
            ],

            /*
            |--------------------------------------------------------------------------
            | Categories section
            |--------------------------------------------------------------------------
            */

            'categories_title' => [
                'sometimes',
                'required',
                'string',
                'max:255',
            ],

            'categories_subtitle' => [
                'nullable',
                'string',
                'max:1000',
            ],

            /*
            |--------------------------------------------------------------------------
            | Featured products section
            |--------------------------------------------------------------------------
            */

            'featured_title' => [
                'sometimes',
                'required',
                'string',
                'max:255',
            ],

            'featured_subtitle' => [
                'nullable',
                'string',
                'max:1000',
            ],

            /*
            |--------------------------------------------------------------------------
            | New arrivals
            |--------------------------------------------------------------------------
            */

            'new_arrivals_title' => [
                'sometimes',
                'required',
                'string',
                'max:255',
            ],

            /*
            |--------------------------------------------------------------------------
            | Offers
            |--------------------------------------------------------------------------
            */

            'offers_title' => [
                'sometimes',
                'required',
                'string',
                'max:255',
            ],

            /*
            |--------------------------------------------------------------------------
            | Promo banner
            |--------------------------------------------------------------------------
            */

            'promo_badge' => [
                'nullable',
                'string',
                'max:255',
            ],

            'promo_title' => [
                'nullable',
                'string',
                'max:255',
            ],

            'promo_description' => [
                'nullable',
                'string',
            ],

            'promo_image' => [
                'nullable',
                'string',
                'max:2048',
            ],

            'promo_button_text' => [
                'nullable',
                'string',
                'max:100',
            ],

            'promo_button_link' => [
                'nullable',
                'string',
                'max:2048',
            ],

            /*
            |--------------------------------------------------------------------------
            | Newsletter
            |--------------------------------------------------------------------------
            */

            'newsletter_title' => [
                'sometimes',
                'required',
                'string',
                'max:255',
            ],

            'newsletter_description' => [
                'nullable',
                'string',
            ],
        ]);

        $settings->fill($validated);
        $settings->save();

        Cache::forget('homepage_settings');

        return response()->json([
            'success' => true,
            'message' => 'Homepage settings updated successfully.',
            'data' => $settings->fresh(),
        ]);
    }
}
