<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class ImageKitController extends Controller
{
    public function auth(): JsonResponse
    {
        $privateKey = config('services.imagekit.private_key');

        if (!$privateKey) {
            return response()->json([
                'success' => false,
                'message' => 'ImageKit private key is not configured.',
            ], 500);
        }

        $token = Str::random(32);

        $expire = time() + 2400;

        $signature = hash_hmac(
            'sha1',
            $token . $expire,
            $privateKey
        );

        return response()->json([
            'success' => true,
            'token' => $token,
            'expire' => $expire,
            'signature' => $signature,
            'publicKey' => config('services.imagekit.public_key'),
            'urlEndpoint' => config('services.imagekit.url_endpoint'),
        ]);
    }
}
