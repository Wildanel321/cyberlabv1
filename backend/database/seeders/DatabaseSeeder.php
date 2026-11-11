<?php

namespace Database\Seeders;

use App\Models\Session;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Instructor
        $instructor = User::firstOrCreate(
            ['email' => 'instructor@cyberlab.edu'],
            [
                'name' => 'Prof. Alex Vance',
                'password' => Hash::make('CyberGuard2024!'),
            ]
        );

        // 2. Active Demo Session
        Session::firstOrCreate(
            ['code' => 'CYB101'],
            [
                'user_id' => $instructor->id,
                'title' => 'Interactive Cybersecurity & AI Privacy Lab',
                'status' => 'active',
                'max_participants' => 50,
                'expires_at' => Carbon::now()->addHours(6),
            ]
        );
    }
}
