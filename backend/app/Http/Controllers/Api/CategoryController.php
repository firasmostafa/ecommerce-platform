<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class CategoryController extends Controller
{
    /**
     * Display all active categories for the storefront.
     */
    public function index(): JsonResponse
    {
        $categories = Cache::remember(
            'storefront_categories',
            now()->addMinutes(10),
            function () {
                return Category::query()
                    ->where('is_active', true)
                    ->withCount([
                        'products' => function ($query) {
                            $query->where('is_active', true);
                        },
                    ])
                    ->orderBy('sort_order')
                    ->orderBy('name')
                    ->get();
            }
        );

        return response()->json([
            'success' => true,
            'data' => $categories,
        ]);
    }

    /**
     * Store a new category.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
            ],
            'slug' => [
                'nullable',
                'string',
                'max:255',
                'unique:categories,slug',
            ],
            'description' => [
                'nullable',
                'string',
            ],
            'image' => [
                'nullable',
                'string',
                'max:2048',
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
        ]);

        $slug = $validated['slug'] ?? Str::slug($validated['name']);

        if (Category::where('slug', $slug)->exists()) {
            $slug .= '-' . Str::lower(Str::random(5));
        }

        $category = Category::create([
            'name' => $validated['name'],
            'slug' => $slug,
            'description' => $validated['description'] ?? null,
            'image' => $validated['image'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
            'sort_order' => $validated['sort_order'] ?? 0,
        ]);

        Cache::forget('storefront_categories');

        return response()->json([
            'success' => true,
            'message' => 'Category created successfully.',
            'data' => $category,
        ], 201);
    }

    /**
     * Display a single category.
     */
    public function show(Category $category): JsonResponse
    {
        $category->loadCount([
            'products' => function ($query) {
                $query->where('is_active', true);
            },
        ]);

        return response()->json([
            'success' => true,
            'data' => $category,
        ]);
    }

    /**
     * Update a category.
     */
    public function update(
        Request $request,
        Category $category
    ): JsonResponse {
        $validated = $request->validate([
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
                Rule::unique('categories', 'slug')->ignore($category->id),
            ],
            'description' => [
                'nullable',
                'string',
            ],
            'image' => [
                'nullable',
                'string',
                'max:2048',
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
        ]);

        if (array_key_exists('name', $validated)) {
            $category->name = $validated['name'];
        }

        if (array_key_exists('slug', $validated)) {
            $category->slug = $validated['slug'];
        } elseif (
            array_key_exists('name', $validated) &&
            $category->name !== $category->getOriginal('name')
        ) {
            $newSlug = Str::slug($validated['name']);

            if (
                Category::where('slug', $newSlug)
                    ->where('id', '!=', $category->id)
                    ->exists()
            ) {
                $newSlug .= '-' . Str::lower(Str::random(5));
            }

            $category->slug = $newSlug;
        }

        if (array_key_exists('description', $validated)) {
            $category->description = $validated['description'];
        }

        if (array_key_exists('image', $validated)) {
            $category->image = $validated['image'];
        }

        if (array_key_exists('is_active', $validated)) {
            $category->is_active = $validated['is_active'];
        }

        if (array_key_exists('sort_order', $validated)) {
            $category->sort_order = $validated['sort_order'];
        }

        $category->save();

        Cache::forget('storefront_categories');

        return response()->json([
            'success' => true,
            'message' => 'Category updated successfully.',
            'data' => $category,
        ]);
    }

    /**
     * Delete a category.
     */
    public function destroy(Category $category): JsonResponse
    {
        $category->delete();

        Cache::forget('storefront_categories');

        return response()->json([
            'success' => true,
            'message' => 'Category deleted successfully.',
        ]);
    }
}
