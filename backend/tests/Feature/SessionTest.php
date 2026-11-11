<?php

namespace Tests\Feature;

use App\Models\Session;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SessionTest extends TestCase
{
    use RefreshDatabase;

    public function test_instructor_can_create_training_session(): void
    {
        $instructor = User::factory()->create();
        Sanctum::actingAs($instructor);

        $response = $this->postJson('/api/v1/instructor/sessions', [
            'title' => 'Web Security Masterclass',
            'max_participants' => 60,
            'expires_in_minutes' => 90,
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => ['id', 'code', 'title', 'status', 'max_participants', 'expires_at'],
            ]);

        $code = $response->json('data.code');
        $this->assertEquals(6, strlen($code));
        $this->assertDatabaseHas('training_sessions', [
            'code' => $code,
            'title' => 'Web Security Masterclass',
            'user_id' => $instructor->id,
        ]);
    }

    public function test_instructor_cannot_access_or_end_another_instructors_session(): void
    {
        $instructorA = User::factory()->create();
        $instructorB = User::factory()->create();

        $sessionA = Session::create([
            'user_id' => $instructorA->id,
            'code' => 'ROOMA1',
            'title' => 'Alpha Room',
            'status' => 'active',
            'max_participants' => 30,
            'expires_at' => Carbon::now()->addHour(),
        ]);

        // Instructor B attempts to access Session A
        Sanctum::actingAs($instructorB);

        $responseShow = $this->getJson("/api/v1/instructor/sessions/{$sessionA->id}");
        $responseShow->assertStatus(404);

        $responseEnd = $this->postJson("/api/v1/instructor/sessions/{$sessionA->id}/end");
        $responseEnd->assertStatus(404);

        // Verify Session A status was not altered
        $this->assertEquals('active', $sessionA->fresh()->status);
    }

    public function test_expired_session_rejects_join_attempts(): void
    {
        $instructor = User::factory()->create();

        $expiredSession = Session::create([
            'user_id' => $instructor->id,
            'code' => 'EXP999',
            'title' => 'Expired Workshop',
            'status' => 'expired',
            'max_participants' => 50,
            'expires_at' => Carbon::now()->subMinutes(10),
        ]);

        $response = $this->postJson('/api/v1/participant/join', [
            'code' => 'EXP999',
            'nickname' => 'LateParticipant',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['code']);
    }
}

