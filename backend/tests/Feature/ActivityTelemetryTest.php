<?php

namespace Tests\Feature;

use App\Models\Participant;
use App\Models\Session;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ActivityTelemetryTest extends TestCase
{
    use RefreshDatabase;

    private User $instructor;
    private Session $session;
    private Participant $participant;
    private string $participantToken;

    protected function setUp(): void
    {
        parent::setUp();

        $this->instructor = User::factory()->create();
        $this->session = Session::create([
            'user_id' => $this->instructor->id,
            'code' => 'TELEM1',
            'title' => 'Telemetry Validation Session',
            'status' => 'active',
            'max_participants' => 50,
            'expires_at' => Carbon::now()->addHours(2),
        ]);

        $plainToken = bin2hex(random_bytes(32));
        $this->participantToken = $plainToken;
        $this->participant = Participant::create([
            'session_id' => $this->session->id,
            'nickname' => 'TelemetryAuditor',
            'token_hash' => hash('sha256', $plainToken),
            'status' => 'active',
            'last_seen_at' => Carbon::now(),
        ]);
    }

    public function test_can_submit_activity_for_all_six_security_tools(): void
    {
        $tools = [
            ['tool_name' => 'password_checker', 'risk_tier' => 'LOW', 'score' => 88],
            ['tool_name' => 'phishing_analyzer', 'risk_tier' => 'HIGH', 'score' => 45],
            ['tool_name' => 'data_leak', 'risk_tier' => 'CRITICAL', 'score' => 20],
            ['tool_name' => 'ai_privacy', 'risk_tier' => 'MEDIUM', 'score' => 70],
            ['tool_name' => 'two_factor', 'risk_tier' => 'LOW', 'score' => 95],
            ['tool_name' => 'cloud_security', 'risk_tier' => 'HIGH', 'score' => 40],
        ];

        foreach ($tools as $t) {
            $response = $this->withHeader('X-Participant-Token', $this->participantToken)
                ->postJson('/api/v1/participant/activities', [
                    'tool_name' => $t['tool_name'],
                    'risk_tier' => $t['risk_tier'],
                    'score' => $t['score'],
                    'duration_seconds' => 15,
                    'metadata' => ['entropy' => 64],
                ]);

            $response->assertStatus(201)
                ->assertJsonPath('data.tool_name', $t['tool_name'])
                ->assertJsonPath('data.score', $t['score']);
        }

        $this->assertEquals(6, $this->participant->activities()->count());
    }

    public function test_zero_pii_sanitization_strips_sensitive_keys_from_metadata(): void
    {
        $response = $this->withHeader('X-Participant-Token', $this->participantToken)
            ->postJson('/api/v1/participant/activities', [
                'tool_name' => 'password_checker',
                'risk_tier' => 'LOW',
                'score' => 90,
                'duration_seconds' => 10,
                'metadata' => [
                    'safe_entropy_bits' => 75,
                    'password' => 'PlaintextPasswordShouldBeStripped',
                    'raw_prompt_text' => 'My secret prompt',
                    'nik' => '3171010105950001',
                    'api_key' => 'sk-secret123',
                ],
            ]);

        $response->assertStatus(201);
        $savedMetadata = $response->json('data.metadata');

        // Verify safe key preserved
        $this->assertArrayHasKey('safe_entropy_bits', $savedMetadata);

        // Verify sensitive keys stripped completely
        $this->assertArrayNotHasKey('password', $savedMetadata);
        $this->assertArrayNotHasKey('raw_prompt_text', $savedMetadata);
        $this->assertArrayNotHasKey('nik', $savedMetadata);
        $this->assertArrayNotHasKey('api_key', $savedMetadata);
    }

    public function test_instructor_receives_computed_analytics_aggregates(): void
    {
        // Record 2 activities
        $this->withHeader('X-Participant-Token', $this->participantToken)
            ->postJson('/api/v1/participant/activities', [
                'tool_name' => 'password_checker',
                'risk_tier' => 'LOW',
                'score' => 90,
                'duration_seconds' => 10,
            ]);

        $this->withHeader('X-Participant-Token', $this->participantToken)
            ->postJson('/api/v1/participant/activities', [
                'tool_name' => 'phishing_analyzer',
                'risk_tier' => 'CRITICAL',
                'score' => 30,
                'duration_seconds' => 20,
            ]);

        Sanctum::actingAs($this->instructor);

        $analyticsResponse = $this->getJson("/api/v1/instructor/sessions/{$this->session->id}/analytics");

        $analyticsResponse->assertStatus(200)
            ->assertJsonPath('data.total_participants', 1)
            ->assertJsonPath('data.active_participants', 1)
            ->assertJsonPath('data.total_activities_completed', 2)
            ->assertJsonPath('data.average_security_score', 60); // (90 + 30) / 2 = 60
    }
}

