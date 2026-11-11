<?php

namespace App\Services;

use App\Models\Activity;
use App\Models\Participant;
use App\Models\Session;
use App\Models\SessionEvent;
use Illuminate\Validation\ValidationException;

class ActivityService
{
    private const ALLOWED_TOOLS = [
        'password_checker',
        'phishing_analyzer',
        'data_leak',
        'ai_privacy',
        'two_factor',
        'cloud_security',
    ];

    private const ALLOWED_RISK_TIERS = [
        'LOW',
        'MEDIUM',
        'HIGH',
        'CRITICAL',
    ];

    /**
     * Record participant tool completion telemetry with strict zero-PII sanitization.
     */
    public function recordActivity(Participant $participant, array $data): Activity
    {
        $toolName = trim($data['tool_name'] ?? '');
        if (!in_array($toolName, self::ALLOWED_TOOLS, true)) {
            throw ValidationException::withMessages(['tool_name' => 'Invalid or unrecognized security tool.']);
        }

        $riskTier = strtoupper(trim($data['risk_tier'] ?? 'LOW'));
        if (!in_array($riskTier, self::ALLOWED_RISK_TIERS, true)) {
            $riskTier = 'LOW';
        }

        $score = min(100, max(0, (int) ($data['score'] ?? 100)));
        $durationSeconds = max(1, (int) ($data['duration_seconds'] ?? 1));

        // Strict Zero-PII sanitization on metadata
        $safeMetadata = $this->sanitizeMetadata($data['metadata'] ?? []);

        $activity = Activity::create([
            'session_id' => $participant->session_id,
            'participant_id' => $participant->id,
            'tool_name' => $toolName,
            'risk_tier' => $riskTier,
            'score' => $score,
            'duration_seconds' => $durationSeconds,
            'metadata' => $safeMetadata,
        ]);

        // Record aggregate event in session timeline
        SessionEvent::create([
            'session_id' => $participant->session_id,
            'event_type' => 'activity.completed',
            'payload' => [
                'activity_id' => $activity->id,
                'participant_nickname' => $participant->nickname,
                'tool_name' => $toolName,
                'risk_tier' => $riskTier,
                'score' => $score,
            ],
            'created_at' => now(),
        ]);

        return $activity;
    }

    /**
     * Sanitizes telemetry metadata to guarantee zero raw passwords, prompts, or PII ever enter storage.
     */
    private function sanitizeMetadata(mixed $raw): array
    {
        if (!is_array($raw)) {
            return [];
        }

        $forbiddenKeys = [
            'password', 'pwd', 'secret', 'token', 'nik', 'prompt', 'email',
            'phone', 'card', 'cvv', 'credit_card', 'api_key', 'private_key',
            'authorization', 'bearer', 'cookie'
        ];

        $safe = [];
        foreach ($raw as $key => $value) {
            $lowerKey = strtolower((string) $key);
            $isForbidden = false;

            foreach ($forbiddenKeys as $bad) {
                if (str_contains($lowerKey, $bad)) {
                    $isForbidden = true;
                    break;
                }
            }

            if (!$isForbidden && (is_scalar($value) || is_array($value))) {
                // Ensure values do not exceed 255 chars
                if (is_string($value) && strlen($value) > 255) {
                    $safe[$key] = substr($value, 0, 255);
                } else {
                    $safe[$key] = $value;
                }
            }
        }

        return $safe;
    }
}

