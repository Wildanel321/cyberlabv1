<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_instructor_can_register_with_valid_credentials(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Dr. Jane Cipher',
            'email' => 'jane@cyberlab.edu',
            'password' => 'DefenseSecret2024!',
            'password_confirmation' => 'DefenseSecret2024!',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'user' => ['id', 'name', 'email'],
                'token',
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'jane@cyberlab.edu',
        ]);
    }

    public function test_instructor_registration_fails_with_weak_password(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Jane',
            'email' => 'jane@cyberlab.edu',
            'password' => 'short',
            'password_confirmation' => 'short',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    public function test_instructor_can_login_and_access_protected_profile(): void
    {
        $user = User::factory()->create([
            'email' => 'alex@cyberlab.edu',
            'password' => bcrypt('StrongPass123!'),
        ]);

        $loginResponse = $this->postJson('/api/v1/auth/login', [
            'email' => 'alex@cyberlab.edu',
            'password' => 'StrongPass123!',
        ]);

        $loginResponse->assertStatus(200)
            ->assertJsonStructure(['token', 'user']);

        $token = $loginResponse->json('token');

        // Access profile with token
        $profileResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/auth/me');

        $profileResponse->assertStatus(200)
            ->assertJson([
                'user' => [
                    'email' => 'alex@cyberlab.edu',
                ],
            ]);
    }

    public function test_unauthenticated_request_is_rejected(): void
    {
        $response = $this->getJson('/api/v1/auth/me');
        $response->assertStatus(401);
    }
}

