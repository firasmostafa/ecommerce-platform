<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\StoreSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InvoiceController extends Controller
{
    /**
     * Display invoice data for an order.
     */
    public function show(
        Request $request,
        Order $order
    ): JsonResponse {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
            ], 401);
        }

        if (!$user->isAdmin() && $order->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'You are not allowed to view this invoice.',
            ], 403);
        }

        $order->load([
            'user',
            'items.product.images',
        ]);

        $settings = StoreSetting::first();

        if (!$settings) {
            return response()->json([
                'success' => false,
                'message' => 'Store settings were not found.',
            ], 500);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'invoice' => [
                    'number' => $order->order_number,
                    'created_at' => $order->created_at,
                    'status' => $order->status,
                    'payment_status' => $order->payment_status,
                    'payment_method' => $order->payment_method,
                    'paid_at' => $order->paid_at,
                ],

                'store' => [
                    'name' => $settings->store_name,
                    'description' => $settings->store_description,
                    'logo' => $settings->logo,

                    'email' => $settings->email,
                    'phone' => $settings->phone,
                    'address' => $settings->address,

                    'currency_code' => $settings->currency_code,
                    'currency_symbol' => $settings->currency_symbol,

                    'invoice_prefix' => $settings->invoice_prefix,
                    'invoice_footer' => $settings->invoice_footer,

                    'primary_color' => $settings->primary_color,
                    'secondary_color' => $settings->secondary_color,
                    'accent_color' => $settings->accent_color,
                ],

                'customer' => [
                    'name' => $order->customer_name,
                    'email' => $order->customer_email,
                    'phone' => $order->customer_phone,

                    'country' => $order->country,
                    'city' => $order->city,
                    'address' => $order->address,

                    'notes' => $order->customer_notes,
                ],

                'items' => $order->items->map(function ($item) {
                    $primaryImage = $item->product
                        ?->images
                        ?->firstWhere('is_primary', true);

                    return [
                        'id' => $item->id,

                        'product_id' => $item->product_id,
                        'name' => $item->product_name,
                        'sku' => $item->product_sku,

                        'image' => $primaryImage?->image,

                        'unit_price' => $item->unit_price,
                        'quantity' => $item->quantity,
                        'discount_amount' => $item->discount_amount,
                        'line_total' => $item->line_total,
                    ];
                }),

                'totals' => [
                    'subtotal' => $order->subtotal,
                    'discount' => $order->discount_amount,
                    'tax' => $order->tax_amount,
                    'shipping' => $order->shipping_amount,
                    'total' => $order->total,
                ],

                'timeline' => [
                    'created_at' => $order->created_at,
                    'confirmed_at' => $order->confirmed_at,
                    'shipped_at' => $order->shipped_at,
                    'delivered_at' => $order->delivered_at,
                    'cancelled_at' => $order->cancelled_at,
                ],
            ],
        ]);
    }
}
