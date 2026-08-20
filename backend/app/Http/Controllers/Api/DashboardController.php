<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Return admin dashboard analytics.
     */
    public function index(): JsonResponse
    {
        $totalOrders = Order::count();

        $totalRevenue = (float) Order::query()
            ->where('payment_status', 'paid')
            ->sum('total');

        $totalCustomers = User::query()
            ->where('role', 'customer')
            ->count();

        $totalProducts = Product::count();

        $pendingOrders = Order::query()
            ->where('status', 'pending')
            ->count();

        $confirmedOrders = Order::query()
            ->where('status', 'confirmed')
            ->count();

        $processingOrders = Order::query()
            ->where('status', 'processing')
            ->count();

        $shippedOrders = Order::query()
            ->where('status', 'shipped')
            ->count();

        $deliveredOrders = Order::query()
            ->where('status', 'delivered')
            ->count();

        $cancelledOrders = Order::query()
            ->where('status', 'cancelled')
            ->count();

        $unpaidOrders = Order::query()
            ->where('payment_status', 'unpaid')
            ->count();

        $paidOrders = Order::query()
            ->where('payment_status', 'paid')
            ->count();

        $lowStockProducts = Product::query()
            ->where('is_active', true)
            ->where('stock', '<=', 10)
            ->orderBy('stock')
            ->limit(8)
            ->get([
                'id',
                'name',
                'slug',
                'sku',
                'stock',
                'price',
                'sale_price',
            ]);

        $recentOrders = Order::query()
            ->latest()
            ->limit(8)
            ->get([
                'id',
                'order_number',
                'customer_name',
                'total',
                'status',
                'payment_status',
                'created_at',
            ]);

        $bestSellingProducts = DB::table('order_items')
            ->select(
                'product_id',
                'product_name',
                'product_sku',
                DB::raw('SUM(quantity) as total_quantity'),
                DB::raw('SUM(line_total) as total_sales')
            )
            ->groupBy(
                'product_id',
                'product_name',
                'product_sku'
            )
            ->orderByDesc('total_quantity')
            ->limit(8)
            ->get();

        $salesByMonth = Order::query()
            ->selectRaw('YEAR(created_at) as year')
            ->selectRaw('MONTH(created_at) as month')
            ->selectRaw('COUNT(*) as orders_count')
            ->selectRaw(
                "SUM(
                    CASE
                        WHEN payment_status = 'paid'
                        THEN total
                        ELSE 0
                    END
                ) as revenue"
            )
            ->where(
                'created_at',
                '>=',
                now()->subMonths(11)->startOfMonth()
            )
            ->groupByRaw('YEAR(created_at), MONTH(created_at)')
            ->orderByRaw('YEAR(created_at), MONTH(created_at)')
            ->get()
            ->map(function ($item) {
                return [
                    'year' => (int) $item->year,
                    'month' => (int) $item->month,
                    'orders_count' => (int) $item->orders_count,
                    'revenue' => round((float) $item->revenue, 2),
                ];
            });

        return response()->json([
            'success' => true,

            'data' => [
                'summary' => [
                    'total_revenue' => round($totalRevenue, 2),
                    'total_orders' => $totalOrders,
                    'total_customers' => $totalCustomers,
                    'total_products' => $totalProducts,
                ],

                'orders' => [
                    'pending' => $pendingOrders,
                    'confirmed' => $confirmedOrders,
                    'processing' => $processingOrders,
                    'shipped' => $shippedOrders,
                    'delivered' => $deliveredOrders,
                    'cancelled' => $cancelledOrders,
                ],

                'payments' => [
                    'paid' => $paidOrders,
                    'unpaid' => $unpaidOrders,
                ],

                'low_stock_products' => $lowStockProducts,

                'recent_orders' => $recentOrders,

                'best_selling_products' => $bestSellingProducts,

                'sales_by_month' => $salesByMonth,
            ],
        ]);
    }
}
