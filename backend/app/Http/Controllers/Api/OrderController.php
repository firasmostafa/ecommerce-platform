<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\StoreSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    /**
     * Display all orders for admin.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Order::query()
            ->with([
                'user',
                'items',
            ])
            ->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('payment_status')) {
            $query->where(
                'payment_status',
                $request->input('payment_status')
            );
        }

        if ($request->filled('search')) {
            $search = trim($request->input('search'));

            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                    ->orWhere('customer_name', 'like', "%{$search}%")
                    ->orWhere('customer_email', 'like', "%{$search}%")
                    ->orWhere('customer_phone', 'like', "%{$search}%");
            });
        }

        $perPage = (int) $request->input('per_page', 15);
        $perPage = max(1, min($perPage, 50));

        $orders = $query
            ->paginate($perPage)
            ->withQueryString();

        return response()->json([
            'success' => true,
            'data' => $orders,
        ]);
    }

    /**
     * Display orders for the authenticated customer.
     */
    public function myOrders(Request $request): JsonResponse
    {
        $orders = Order::query()
            ->where('user_id', $request->user()->id)
            ->with('items')
            ->latest()
            ->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $orders,
        ]);
    }

    /**
     * Display a single order.
     */
    public function show(Request $request, Order $order): JsonResponse
    {
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
                'message' => 'You are not allowed to view this order.',
            ], 403);
        }

        $order->load([
            'user',
            'items.product.images',
        ]);

        return response()->json([
            'success' => true,
            'data' => $order,
        ]);
    }

    /**
     * Create a new customer order.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'customer_name' => [
                'required',
                'string',
                'max:255',
            ],
            'customer_email' => [
                'nullable',
                'email',
                'max:255',
            ],
            'customer_phone' => [
                'required',
                'string',
                'max:50',
            ],
            'country' => [
                'nullable',
                'string',
                'max:100',
            ],
            'city' => [
                'required',
                'string',
                'max:100',
            ],
            'address' => [
                'required',
                'string',
                'max:1000',
            ],
            'customer_notes' => [
                'nullable',
                'string',
                'max:2000',
            ],
            'payment_method' => [
                'required',
                'in:cash_on_delivery',
            ],
            'items' => [
                'required',
                'array',
                'min:1',
            ],
            'items.*.product_id' => [
                'required',
                'integer',
                'exists:products,id',
            ],
            'items.*.quantity' => [
                'required',
                'integer',
                'min:1',
            ],
        ]);

        $settings = StoreSetting::first();

        if (!$settings) {
            return response()->json([
                'success' => false,
                'message' => 'Store settings were not found.',
            ], 500);
        }

        try {
            $order = DB::transaction(function () use (
                $request,
                $validated,
                $settings
            ) {
                $subtotal = 0;
                $orderItems = [];

                foreach ($validated['items'] as $item) {
                    $product = Product::query()
                        ->where('id', $item['product_id'])
                        ->where('is_active', true)
                        ->lockForUpdate()
                        ->first();

                    if (!$product) {
                        abort(
                            422,
                            'One of the selected products is unavailable.'
                        );
                    }

                    $quantity = (int) $item['quantity'];

                    if ($product->stock < $quantity) {
                        abort(
                            422,
                            "Insufficient stock for {$product->name}."
                        );
                    }

                    $unitPrice = $product->sale_price !== null
                        && (float) $product->sale_price < (float) $product->price
                            ? (float) $product->sale_price
                            : (float) $product->price;

                    $lineTotal = round(
                        $unitPrice * $quantity,
                        2
                    );

                    $subtotal += $lineTotal;

                    $orderItems[] = [
                        'product' => $product,
                        'product_id' => $product->id,
                        'product_name' => $product->name,
                        'product_sku' => $product->sku,
                        'unit_price' => $unitPrice,
                        'quantity' => $quantity,
                        'discount_amount' => 0,
                        'line_total' => $lineTotal,
                    ];
                }

                $subtotal = round($subtotal, 2);

                $discountAmount = 0;

                $shippingAmount = (float) $settings->shipping_fee;

                if (
                    $settings->free_shipping_threshold !== null
                    && $subtotal >= (float) $settings->free_shipping_threshold
                ) {
                    $shippingAmount = 0;
                }

                $taxAmount = 0;

                if ($settings->tax_enabled) {
                    $taxableAmount = max(
                        0,
                        $subtotal - $discountAmount
                    );

                    $taxAmount = round(
                        $taxableAmount
                        * ((float) $settings->tax_rate / 100),
                        2
                    );
                }

                $total = round(
                    $subtotal
                    - $discountAmount
                    + $taxAmount
                    + $shippingAmount,
                    2
                );

                $order = Order::create([
                    'user_id' => $request->user()?->id,

                    'order_number' =>
                        $this->generateOrderNumber(
                            $settings->invoice_prefix
                        ),

                    'customer_name' => $validated['customer_name'],
                    'customer_email' =>
                        $validated['customer_email'] ?? null,
                    'customer_phone' => $validated['customer_phone'],

                    'country' => $validated['country'] ?? null,
                    'city' => $validated['city'],
                    'address' => $validated['address'],
                    'customer_notes' =>
                        $validated['customer_notes'] ?? null,

                    'subtotal' => $subtotal,
                    'discount_amount' => $discountAmount,
                    'tax_amount' => $taxAmount,
                    'shipping_amount' => $shippingAmount,
                    'total' => $total,

                    'payment_method' =>
                        $validated['payment_method'],
                    'payment_status' => 'unpaid',

                    'status' => 'pending',
                ]);

                foreach ($orderItems as $item) {
                    $order->items()->create([
                        'product_id' => $item['product_id'],
                        'product_name' => $item['product_name'],
                        'product_sku' => $item['product_sku'],
                        'unit_price' => $item['unit_price'],
                        'quantity' => $item['quantity'],
                        'discount_amount' =>
                            $item['discount_amount'],
                        'line_total' => $item['line_total'],
                    ]);

                    $item['product']->decrement(
                        'stock',
                        $item['quantity']
                    );
                }

                return $order->load([
                    'items',
                ]);
            });

            return response()->json([
                'success' => true,
                'message' => 'Order created successfully.',
                'data' => $order,
            ], 201);
        } catch (\Symfony\Component\HttpKernel\Exception\HttpException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $e->getStatusCode());
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Unable to create the order.',
            ], 500);
        }
    }

    /**
     * Update order status.
     */
    public function updateStatus(
        Request $request,
        Order $order
    ): JsonResponse {
        $validated = $request->validate([
            'status' => [
                'required',
                'in:pending,confirmed,processing,shipped,delivered,cancelled',
            ],
        ]);

        $newStatus = $validated['status'];

        $order->status = $newStatus;

        if ($newStatus === 'confirmed' && !$order->confirmed_at) {
            $order->confirmed_at = now();
        }

        if ($newStatus === 'shipped' && !$order->shipped_at) {
            $order->shipped_at = now();
        }

        if ($newStatus === 'delivered' && !$order->delivered_at) {
            $order->delivered_at = now();
        }

        if ($newStatus === 'cancelled' && !$order->cancelled_at) {
            $order->cancelled_at = now();
        }

        $order->save();

        return response()->json([
            'success' => true,
            'message' => 'Order status updated successfully.',
            'data' => $order,
        ]);
    }

    /**
     * Update payment status.
     */
    public function updatePaymentStatus(
        Request $request,
        Order $order
    ): JsonResponse {
        $validated = $request->validate([
            'payment_status' => [
                'required',
                'in:unpaid,paid,refunded',
            ],
        ]);

        $newPaymentStatus = $validated['payment_status'];

        $order->payment_status = $newPaymentStatus;

        if ($newPaymentStatus === 'paid' && !$order->paid_at) {
            $order->paid_at = now();
        }

        if ($newPaymentStatus !== 'paid') {
            $order->paid_at = null;
        }

        $order->save();

        return response()->json([
            'success' => true,
            'message' => 'Payment status updated successfully.',
            'data' => $order,
        ]);
    }
    /**
 * Cancel an order by the authenticated customer.
 */
public function cancel(
    Request $request,
    Order $order
): JsonResponse {
    $user = $request->user();

    if ($order->user_id !== $user->id) {
        return response()->json([
            'success' => false,
            'message' => 'You are not allowed to cancel this order.',
        ], 403);
    }

    if (!in_array($order->status, [
        'pending',
        'confirmed',
    ], true)) {
        return response()->json([
            'success' => false,
            'message' =>
                'This order can no longer be cancelled.',
        ], 422);
    }

    try {
        DB::transaction(function () use ($order) {
            $order->load('items');

            foreach ($order->items as $item) {
                if (!$item->product_id) {
                    continue;
                }

                $product = Product::query()
                    ->where('id', $item->product_id)
                    ->lockForUpdate()
                    ->first();

                if ($product) {
                    $product->increment(
                        'stock',
                        $item->quantity
                    );
                }
            }

            $order->status = 'cancelled';
            $order->cancelled_at = now();

            $order->save();
        });

        $order->refresh();
        $order->load('items');

        return response()->json([
            'success' => true,
            'message' =>
                'Order cancelled successfully.',
            'data' => $order,
        ]);
    } catch (\Throwable $e) {
        return response()->json([
            'success' => false,
            'message' =>
                'Unable to cancel the order.',
        ], 500);
    }
}

    /**
     * Generate a unique order/invoice number.
     */
    private function generateOrderNumber(string $prefix): string
    {
        do {
            $number = strtoupper($prefix)
                . '-'
                . now()->format('Y')
                . '-'
                . Str::upper(Str::random(8));
        } while (
            Order::where('order_number', $number)->exists()
        );

        return $number;
    }
}
