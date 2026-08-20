<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    /**
     * Return all customers with order statistics.
     */
    public function index(Request $request): JsonResponse
    {
        $search = trim(
            (string) $request->query('search', '')
        );

        $customers = User::query()
            ->where('role', 'customer')
            ->when(
                $search !== '',
                function ($query) use ($search) {
                    $query->where(
                        function ($subQuery) use ($search) {
                            $subQuery
                                ->where(
                                    'name',
                                    'like',
                                    "%{$search}%"
                                )
                                ->orWhere(
                                    'email',
                                    'like',
                                    "%{$search}%"
                                )
                                ->orWhere(
                                    'phone',
                                    'like',
                                    "%{$search}%"
                                );
                        }
                    );
                }
            )
            ->withCount('orders')
            ->withSum(
                [
                    'orders as total_spent' => function ($query) {
                        $query->where(
                            'payment_status',
                            'paid'
                        );
                    },
                ],
                'total'
            )
            ->latest()
            ->get([
                'id',
                'name',
                'email',
                'phone',
                'role',
                'created_at',
                'updated_at',
            ]);

        return response()->json([
            'success' => true,
            'data' => $customers,
        ]);
    }

    /**
     * Return one customer with their orders.
     */
    public function show(User $customer): JsonResponse
    {
        if (!$customer->isCustomer()) {
            return response()->json([
                'success' => false,
                'message' => 'This user is not a customer.',
            ], 404);
        }

        $customer->load([
            'orders' => function ($query) {
                $query
                    ->latest()
                    ->with([
                        'items',
                    ]);
            },
        ]);

        $totalSpent = $customer
            ->orders()
            ->where(
                'payment_status',
                'paid'
            )
            ->sum('total');

        $totalOrders = $customer
            ->orders()
            ->count();

        $pendingOrders = $customer
            ->orders()
            ->where(
                'status',
                'pending'
            )
            ->count();

        $deliveredOrders = $customer
            ->orders()
            ->where(
                'status',
                'delivered'
            )
            ->count();

        return response()->json([
            'success' => true,

            'data' => [
                'customer' => [
                    'id' => $customer->id,
                    'name' => $customer->name,
                    'email' => $customer->email,
                    'phone' => $customer->phone,
                    'role' => $customer->role,
                    'created_at' => $customer->created_at,
                    'updated_at' => $customer->updated_at,
                ],

                'summary' => [
                    'total_orders' => $totalOrders,
                    'pending_orders' => $pendingOrders,
                    'delivered_orders' => $deliveredOrders,
                    'total_spent' => $totalSpent,
                ],

                'orders' => $customer->orders,
            ],
        ]);
    }
}
