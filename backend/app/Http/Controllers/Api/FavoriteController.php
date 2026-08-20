<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Get user favorites
    |--------------------------------------------------------------------------
    */

    public function index(Request $request): JsonResponse
    {
        $products = $request->user()
            ->favoriteProducts()
            ->with([
                'category',
                'images',
            ])
            ->latest('favorites.created_at')
            ->get();

        return response()->json([
            'data' => $products,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Add product to favorites
    |--------------------------------------------------------------------------
    */

    public function store(
        Request $request,
        Product $product
    ): JsonResponse {
        $request->user()
            ->favoriteProducts()
            ->syncWithoutDetaching([
                $product->id,
            ]);

        return response()->json([
            'message' => 'Product added to favorites.',
            'product_id' => $product->id,
        ], 201);
    }

    /*
    |--------------------------------------------------------------------------
    | Remove product from favorites
    |--------------------------------------------------------------------------
    */

    public function destroy(
        Request $request,
        Product $product
    ): JsonResponse {
        $request->user()
            ->favoriteProducts()
            ->detach($product->id);

        return response()->json([
            'message' => 'Product removed from favorites.',
            'product_id' => $product->id,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Check if product is favorite
    |--------------------------------------------------------------------------
    */

    public function check(
        Request $request,
        Product $product
    ): JsonResponse {
        $isFavorite = $request->user()
            ->favoriteProducts()
            ->where(
                'products.id',
                $product->id
            )
            ->exists();

        return response()->json([
            'is_favorite' => $isFavorite,
        ]);
    }
}
