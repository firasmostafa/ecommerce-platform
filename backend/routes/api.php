<?php

use App\Http\Controllers\Api\AdminUserController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\FavoriteController;
use App\Http\Controllers\Api\HomeSettingController;
use App\Http\Controllers\Api\InvoiceController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\StoreSettingController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
*/

Route::post('/register', [
    AuthController::class,
    'register',
]);

Route::post('/login', [
    AuthController::class,
    'login',
]);

/*
|--------------------------------------------------------------------------
| Public Storefront Routes
|--------------------------------------------------------------------------
*/

Route::get('/store-settings', [
    StoreSettingController::class,
    'show',
]);

Route::get('/home-settings', [
    HomeSettingController::class,
    'show',
]);

Route::get('/categories', [
    CategoryController::class,
    'index',
]);

Route::get('/categories/{category}', [
    CategoryController::class,
    'show',
]);

Route::get('/products', [
    ProductController::class,
    'index',
]);

Route::get('/products/{product}', [
    ProductController::class,
    'show',
]);

/*
|--------------------------------------------------------------------------
| Authenticated Customer Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    /*
    |--------------------------------------------------------------------------
    | Account
    |--------------------------------------------------------------------------
    */

    Route::get('/me', [
        AuthController::class,
        'me',
    ]);

    Route::post('/logout', [
        AuthController::class,
        'logout',
    ]);

    /*
    |--------------------------------------------------------------------------
    | Favorites
    |--------------------------------------------------------------------------
    */

    Route::get('/favorites', [
        FavoriteController::class,
        'index',
    ]);

    Route::post('/favorites/{product}', [
        FavoriteController::class,
        'store',
    ]);

    Route::delete('/favorites/{product}', [
        FavoriteController::class,
        'destroy',
    ]);

    Route::get('/favorites/{product}/check', [
        FavoriteController::class,
        'check',
    ]);

    /*
    |--------------------------------------------------------------------------
    | Orders
    |--------------------------------------------------------------------------
    */

    Route::post('/orders', [
        OrderController::class,
        'store',
    ]);

    Route::get('/my-orders', [
        OrderController::class,
        'myOrders',
    ]);

    Route::get('/orders/{order}', [
        OrderController::class,
        'show',
    ]);

    Route::patch('/orders/{order}/cancel', [
        OrderController::class,
        'cancel',
    ]);

    Route::get('/orders/{order}/invoice', [
        InvoiceController::class,
        'show',
    ]);
});

/*
|--------------------------------------------------------------------------
| Admin Only Routes
|--------------------------------------------------------------------------
*/

Route::middleware([
    'auth:sanctum',
    'admin',
])->prefix('admin')->group(function () {

    /*
    |--------------------------------------------------------------------------
    | Dashboard
    |--------------------------------------------------------------------------
    */

    Route::get('/dashboard', [
        DashboardController::class,
        'index',
    ]);

    /*
    |--------------------------------------------------------------------------
    | Orders
    |--------------------------------------------------------------------------
    */

    Route::get('/orders', [
        OrderController::class,
        'index',
    ]);

    Route::get('/orders/{order}', [
        OrderController::class,
        'show',
    ]);

    Route::patch('/orders/{order}/status', [
        OrderController::class,
        'updateStatus',
    ]);

    Route::patch('/orders/{order}/payment-status', [
        OrderController::class,
        'updatePaymentStatus',
    ]);

    Route::get('/orders/{order}/invoice', [
        InvoiceController::class,
        'show',
    ]);

    /*
    |--------------------------------------------------------------------------
    | Store Customization
    |--------------------------------------------------------------------------
    */

    Route::put('/store-settings', [
        StoreSettingController::class,
        'update',
    ]);

    Route::put('/home-settings', [
        HomeSettingController::class,
        'update',
    ]);

    /*
    |--------------------------------------------------------------------------
    | Category Management
    |--------------------------------------------------------------------------
    */

    Route::post('/categories', [
        CategoryController::class,
        'store',
    ]);

    Route::put('/categories/{category}', [
        CategoryController::class,
        'update',
    ]);

    Route::patch('/categories/{category}', [
        CategoryController::class,
        'update',
    ]);

    Route::delete('/categories/{category}', [
        CategoryController::class,
        'destroy',
    ]);

    /*
    |--------------------------------------------------------------------------
    | Product Management
    |--------------------------------------------------------------------------
    */

    Route::post('/products', [
        ProductController::class,
        'store',
    ]);

    Route::put('/products/{product}', [
        ProductController::class,
        'update',
    ]);

    Route::patch('/products/{product}', [
        ProductController::class,
        'update',
    ]);

    Route::delete('/products/{product}', [
        ProductController::class,
        'destroy',
    ]);

    /*
    |--------------------------------------------------------------------------
    | Administrator Management
    |--------------------------------------------------------------------------
    */

    Route::get('/admins', [
        AdminUserController::class,
        'index',
    ]);

    Route::post('/admins', [
        AdminUserController::class,
        'store',
    ]);

    Route::put('/admins/{admin}', [
        AdminUserController::class,
        'update',
    ]);

    Route::patch('/admins/{admin}', [
        AdminUserController::class,
        'update',
    ]);

    Route::delete('/admins/{admin}', [
        AdminUserController::class,
        'destroy',
    ]);

    /*
    |--------------------------------------------------------------------------
    | Customer Management
    |--------------------------------------------------------------------------
    */

    Route::get('/customers', [
        CustomerController::class,
        'index',
    ]);

    Route::get('/customers/{customer}', [
        CustomerController::class,
        'show',
    ]);
});
