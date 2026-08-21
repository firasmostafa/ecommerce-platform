<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class ProductController extends Controller
{
    /**
     * Display products for the storefront.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Product::query()
            ->with([
                'category',
                'images',
            ])
            ->where('is_active', true);

        if ($request->filled('search')) {
            $search = trim($request->input('search'));

            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%")
                    ->orWhere('short_description', 'like', "%{$search}%");
            });
        }

        if ($request->filled('category')) {
            $category = $request->input('category');

            $query->whereHas('category', function ($q) use ($category) {
                $q->where('slug', $category)
                    ->where('is_active', true);
            });
        }

    if ($request->boolean('featured')) {
    $query->where('is_featured', true);
}
        if ($request->boolean('on_sale')) {
            $query->whereNotNull('sale_price')
                ->whereColumn('sale_price', '<', 'price');
        }

        if ($request->boolean('in_stock')) {
            $query->where('stock', '>', 0);
        }

        if ($request->filled('min_price')) {
            $query->whereRaw(
                'COALESCE(sale_price, price) >= ?',
                [(float) $request->input('min_price')]
            );
        }

        if ($request->filled('max_price')) {
            $query->whereRaw(
                'COALESCE(sale_price, price) <= ?',
                [(float) $request->input('max_price')]
            );
        }

        $sort = $request->input('sort', 'newest');

        switch ($sort) {
            case 'oldest':
                $query->orderBy('created_at');
                break;

            case 'price_low':
                $query->orderByRaw('COALESCE(sale_price, price) ASC');
                break;

            case 'price_high':
                $query->orderByRaw('COALESCE(sale_price, price) DESC');
                break;

            case 'name_asc':
                $query->orderBy('name');
                break;

            case 'name_desc':
                $query->orderByDesc('name');
                break;

            default:
                $query->orderByDesc('created_at');
                break;
        }

        $query->orderBy('sort_order');

        $perPage = (int) $request->input('per_page', 12);
        $perPage = max(1, min($perPage, 48));

        $products = $query
            ->paginate($perPage)
            ->withQueryString();

        return response()->json([
            'success' => true,
            'data' => $products,
        ]);
    }

    /**
     * Store a newly created product.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category_id' => [
                'nullable',
                'exists:categories,id',
            ],

            'name' => [
                'required',
                'string',
                'max:255',
            ],

            'slug' => [
                'nullable',
                'string',
                'max:255',
                'unique:products,slug',
            ],

            'sku' => [
                'nullable',
                'string',
                'max:100',
                'unique:products,sku',
            ],

            'short_description' => [
                'nullable',
                'string',
                'max:1000',
            ],

            'description' => [
                'nullable',
                'string',
            ],

            'price' => [
                'required',
                'numeric',
                'min:0',
            ],

            'sale_price' => [
                'nullable',
                'numeric',
                'min:0',
                'lt:price',
            ],

            'stock' => [
                'sometimes',
                'integer',
                'min:0',
            ],

            'low_stock_threshold' => [
                'sometimes',
                'integer',
                'min:0',
            ],

            'is_featured' => [
                'sometimes',
                'boolean',
            ],

            'is_active' => [
                'sometimes',
                'boolean',
            ],

            'sort_order' => [
                'sometimes',
                'integer',
                'min:0',
            ],

            /*
            |--------------------------------------------------------------------------
            | ImageKit URLs
            |--------------------------------------------------------------------------
            */

            'images' => [
                'nullable',
                'array',
                'max:10',
            ],

            'images.*' => [
                'required',
                'string',
                'url',
                'max:2048',
            ],
        ]);

        $slug = $validated['slug'] ?? Str::slug($validated['name']);

        if (Product::where('slug', $slug)->exists()) {
            $slug .= '-' . Str::lower(Str::random(5));
        }

        $product = DB::transaction(function () use ($validated, $slug) {
            $product = Product::create([
                'category_id' => $validated['category_id'] ?? null,
                'name' => $validated['name'],
                'slug' => $slug,
                'sku' => $validated['sku'] ?? null,
                'short_description' => $validated['short_description'] ?? null,
                'description' => $validated['description'] ?? null,
                'price' => $validated['price'],
                'sale_price' => $validated['sale_price'] ?? null,
                'stock' => $validated['stock'] ?? 0,
                'low_stock_threshold' => $validated['low_stock_threshold'] ?? 5,
                'is_featured' => $validated['is_featured'] ?? false,
                'is_active' => $validated['is_active'] ?? true,
                'sort_order' => $validated['sort_order'] ?? 0,
            ]);

            $this->saveProductImages(
                $product,
                $validated['images'] ?? []
            );

            return $product;
        });

        $product->load([
            'category',
            'images',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Product created successfully.',
            'data' => $product,
        ], 201);
    }

    /**
     * Display a single product.
     */
    public function show(Product $product): JsonResponse
    {
        $product->load([
            'category',
            'images',
        ]);

        return response()->json([
            'success' => true,
            'data' => $product,
        ]);
    }

    /**
     * Update an existing product.
     */
    public function update(
        Request $request,
        Product $product
    ): JsonResponse {
        $validated = $request->validate([
            'category_id' => [
                'nullable',
                'exists:categories,id',
            ],

            'name' => [
                'sometimes',
                'required',
                'string',
                'max:255',
            ],

            'slug' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('products', 'slug')->ignore($product->id),
            ],

            'sku' => [
                'nullable',
                'string',
                'max:100',
                Rule::unique('products', 'sku')->ignore($product->id),
            ],

            'short_description' => [
                'nullable',
                'string',
                'max:1000',
            ],

            'description' => [
                'nullable',
                'string',
            ],

            'price' => [
                'sometimes',
                'required',
                'numeric',
                'min:0',
            ],

            'sale_price' => [
                'nullable',
                'numeric',
                'min:0',
            ],

            'stock' => [
                'sometimes',
                'integer',
                'min:0',
            ],

            'low_stock_threshold' => [
                'sometimes',
                'integer',
                'min:0',
            ],

            'is_featured' => [
                'sometimes',
                'boolean',
            ],

            'is_active' => [
                'sometimes',
                'boolean',
            ],

            'sort_order' => [
                'sometimes',
                'integer',
                'min:0',
            ],

            'images' => [
                'sometimes',
                'array',
                'max:10',
            ],

            'images.*' => [
                'required',
                'string',
                'url',
                'max:2048',
            ],
        ]);

        if (
            array_key_exists('sale_price', $validated)
            && $validated['sale_price'] !== null
        ) {
            $price = $validated['price'] ?? $product->price;

            if ((float) $validated['sale_price'] >= (float) $price) {
                return response()->json([
                    'success' => false,
                    'message' => 'Sale price must be lower than the regular price.',
                ], 422);
            }
        }

        DB::transaction(function () use ($validated, $product) {
            if (array_key_exists('name', $validated)) {
                $product->name = $validated['name'];
            }

            if (array_key_exists('slug', $validated)) {
                $product->slug = $validated['slug'];
            } elseif (array_key_exists('name', $validated)) {
                $slug = Str::slug($validated['name']);

                if (
                    Product::where('slug', $slug)
                        ->where('id', '!=', $product->id)
                        ->exists()
                ) {
                    $slug .= '-' . Str::lower(Str::random(5));
                }

                $product->slug = $slug;
            }

            $fields = [
                'category_id',
                'sku',
                'short_description',
                'description',
                'price',
                'sale_price',
                'stock',
                'low_stock_threshold',
                'is_featured',
                'is_active',
                'sort_order',
            ];

            foreach ($fields as $field) {
                if (array_key_exists($field, $validated)) {
                    $product->{$field} = $validated[$field];
                }
            }

            $product->save();

            /*
            |--------------------------------------------------------------------------
            | Replace images only when new images were sent
            |--------------------------------------------------------------------------
            */

            if (array_key_exists('images', $validated)) {
                $product->images()->delete();

                $this->saveProductImages(
                    $product,
                    $validated['images']
                );
            }
        });

        $product->load([
            'category',
            'images',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Product updated successfully.',
            'data' => $product,
        ]);
    }

    /**
     * Delete a product.
     */
    public function destroy(Product $product): JsonResponse
    {
        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'Product deleted successfully.',
        ]);
    }

    /**
     * Save ImageKit URLs in product_images table.
     */
    private function saveProductImages(
        Product $product,
        array $images
    ): void {
        foreach ($images as $index => $imageUrl) {
            ProductImage::create([
                'product_id' => $product->id,
                'image' => $imageUrl,
                'alt_text' => $product->name,
                'is_primary' => $index === 0,
                'sort_order' => $index,
            ]);
        }
    }
}
