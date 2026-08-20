<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class AdminUserController extends Controller
{
    /**
     * Get all administrator accounts.
     */
    public function index(Request $request): JsonResponse
    {
        $search = trim((string) $request->query('search', ''));

        $admins = User::query()
            ->where('role', 'admin')
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($subQuery) use ($search) {
                    $subQuery
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%");
                });
            })
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
            'data' => $admins,
        ]);
    }

    /**
     * Create a new administrator.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
            ],

            'email' => [
                'required',
                'email',
                'max:255',
                'unique:users,email',
            ],

            'phone' => [
                'nullable',
                'string',
                'max:30',
            ],

            'password' => [
                'required',
                'string',
                'min:8',
                'confirmed',
            ],
        ]);

        $admin = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'password' => Hash::make($validated['password']),
            'role' => 'admin',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Administrator created successfully.',
            'data' => [
                'id' => $admin->id,
                'name' => $admin->name,
                'email' => $admin->email,
                'phone' => $admin->phone,
                'role' => $admin->role,
                'created_at' => $admin->created_at,
                'updated_at' => $admin->updated_at,
            ],
        ], 201);
    }

    /**
     * Update an administrator.
     */
    public function update(
        Request $request,
        User $admin
    ): JsonResponse {
        if (!$admin->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'This user is not an administrator.',
            ], 404);
        }

        $validated = $request->validate([
            'name' => [
                'sometimes',
                'required',
                'string',
                'max:255',
            ],

            'email' => [
                'sometimes',
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')
                    ->ignore($admin->id),
            ],

            'phone' => [
                'nullable',
                'string',
                'max:30',
            ],

            'password' => [
                'nullable',
                'string',
                'min:8',
                'confirmed',
            ],
        ]);

        if (array_key_exists('name', $validated)) {
            $admin->name = $validated['name'];
        }

        if (array_key_exists('email', $validated)) {
            $admin->email = $validated['email'];
        }

        if (array_key_exists('phone', $validated)) {
            $admin->phone = $validated['phone'];
        }

        if (!empty($validated['password'])) {
            $admin->password = Hash::make(
                $validated['password']
            );
        }

        // Keep this account as an administrator.
        $admin->role = 'admin';

        $admin->save();

        return response()->json([
            'success' => true,
            'message' => 'Administrator updated successfully.',
            'data' => [
                'id' => $admin->id,
                'name' => $admin->name,
                'email' => $admin->email,
                'phone' => $admin->phone,
                'role' => $admin->role,
                'created_at' => $admin->created_at,
                'updated_at' => $admin->updated_at,
            ],
        ]);
    }

    /**
     * Delete an administrator.
     */
    public function destroy(
        Request $request,
        User $admin
    ): JsonResponse {
        if (!$admin->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'This user is not an administrator.',
            ], 404);
        }

        if ($request->user()->id === $admin->id) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot delete your own administrator account.',
            ], 422);
        }

        /*
         * Prevent deleting the last admin account.
         */
        $adminsCount = User::where(
            'role',
            'admin'
        )->count();

        if ($adminsCount <= 1) {
            return response()->json([
                'success' => false,
                'message' => 'The last administrator account cannot be deleted.',
            ], 422);
        }

        /*
         * Revoke all tokens before deleting.
         */
        $admin->tokens()->delete();

        $admin->delete();

        return response()->json([
            'success' => true,
            'message' => 'Administrator deleted successfully.',
        ]);
    }
}
