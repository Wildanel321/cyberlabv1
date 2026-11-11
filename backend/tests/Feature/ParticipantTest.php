<?php

namespace Tests\Feature;

use App\Models\Participant;
use App\Models\Session;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ParticipantTest extends TestCase
{
    use RefreshDatabase;

    private Session $session;

    protected function setUp(): void
    {
        parent::setUp();

        $instructor = User::factory()->create();
        $this->session = Session::create([
            'user_id' => $instructor->id,
            'code' => 'TEST99',
            'title' => 'Participant Flow Test',
            'status' => 'active',
            'max_participants' => 40,
            'expires_at' => Carbon::now()->addHours(2),
        ]);
    }

    public function test_participant_can_join_without_registration(): void
    {
        $response = $this->postJson('/api/v1/participant/join', [
            'code' => 'TEST99',
            'nickname' => 'CyberStudent',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'participant_id',
                    'participant_token',
                    'nickname',
                    'session' => ['id', 'code', 'title', 'status'],
                ],
            ]);

        $participantId = $response->json('data.participant_id');
        $plainToken = $response->json('data.participant_token');

        // Verify token is 64 hex characters (256 bits)
        $this->assertEquals(64, strlen($plainToken));

        // CRITICAL SECURITY ASSERTION: Verify token is NOT stored in plaintext
        $participantInDb = Participant::findOrFail($participantId);
        $this->assertNotEquals($plainToken, $participantInDb->token_hash);
        $this->assertEquals(hash('sha256', $plainToken), $participantInDb->token_hash);
    }

    public function test_participant_heartbeat_updates_timestamp(): void
    {
        $joinResponse = $this->postJson('/api/v1/participant/join', [
            'code' => 'TEST99',
            'nickname' => 'HeartbeatUser',
        ]);

        $token = $joinResponse->json('data.participant_token');
        $participantId = $joinResponse->json('data.participant_id');

        $initialLastSeen = Participant::findOrFail($participantId)->last_seen_at;

        // Sleep 1 second to verify timestamp advancement
        sleep(1);

        $heartbeatResponse = $this->withHeader('X-Participant-Token', $token)
            ->postJson('/api/v1/participant/heartbeat');

        $heartbeatResponse->assertStatus(200)
            ->assertJson(['status' => 'acknowledged']);

        $updatedLastSeen = Participant::findOrFail($participantId)->last_seen_at;
        $this->assertTrue($updatedLastSeen->gt($initialLastSeen));
    }

    public function test_unauthorized_request_without_token_is_blocked(): void
    {
        $response = $this->postJson('/api/v1/participant/heartbeat');
        $response->assertStatus(401);
    }

    public function test_participant_can_leave_session(): void
    {
        $joinResponse = $this->postJson('/api/v1/participant/join', [
            'code' => 'TEST99',
            'nickname' => 'LeavingUser',
        ]);

        $token = $joinResponse->json('data.participant_token');
        $participantId = $joinResponse->json('data.participant_id');

        $leaveResponse = $this->withHeader('X-Participant-Token', $token)
            ->postJson('/api/v1/participant/leave');

        $leaveResponse->assertStatus(200);

        $participant = Participant::findOrFail($participantId);
        $this->assertEquals('disconnected', $participant->status);
    }
}

