<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    /**
     * Create or update the default admin account.
     */
    public function run(): void
    {
        User::updateOrCreate(
            [
                'email' => 'admin@novastore.test',
            ],
            [
                'name' => 'Nova Store Admin',
                'phone' => null,
                'password' => 'Admin123!',
                'role' => 'admin',
            ]
        );
    }
}
