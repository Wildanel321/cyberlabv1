<?php

namespace App\Services;

use App\Models\Participant;
use App\Models\Session;
use Carbon\Carbon;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class ParticipantService
{
    /**
     * Join a participant into a session.
     * Returns an array containing the participant model and the plaintext bearer token.
     */
    public function join(Session $session, string $nickname): array
    {
        $cleanNickname = trim(strip_tags($nickname));

        if (empty($cleanNickname)) {
            throw ValidationException::withMessages(['nickname' => 'A nickname is required.']);
        }

        // Generate cryptographically random token (256-bit entropy)
        $plainToken = bin2hex(random_bytes(32));
        $tokenHash = hash('sha256', $plainToken);

        $participant = Participant::create([
            'session_id' => $session->id,
            'nickname' => Str::limit($cleanNickname, 40),
            'token_hash' => $tokenHash,
            'status' => 'active',
            'last_seen_at' => Carbon::now(),
        ]);

        return [
            'participant' => $participant,
            'token' => $plainToken,
        ];
    }

    /**
     * Authenticate and resolve a participant from plaintext token.
     */
    public function resolveParticipantFromToken(?string $plainToken): ?Participant
    {
        if (empty($plainToken)) {
            return null;
        }

        $hash = hash('sha256', trim($plainToken));
        return Participant::where('token_hash', $hash)->first();
    }

    /**
     * Record participant heartbeat ping.
     */
    public function heartbeat(Participant $participant): void
    {
        $participant->update([
            'status' => 'active',
            'last_seen_at' => Carbon::now(),
        ]);
    }

    /**
     * Mark participant as disconnected / left.
     */
    public function leave(Participant $participant): void
    {
        $participant->update([
            'status' => 'disconnected',
            'last_seen_at' => Carbon::now(),
        ]);
    }

    /**
     * Background cleanup: mark participants idle after 45s and disconnected after 90s without heartbeat.
     */
    public function updateStatusesForSession(Session $session): void
    {
        $now = Carbon::now();

        // Over 90 seconds without ping -> disconnected
        $session->participants()
            ->where('status', '!=', 'disconnected')
            ->where('last_seen_at', '<', $now->copy()->subSeconds(90))
            ->update(['status' => 'disconnected']);

        // Over 35 seconds without ping -> idle
        $session->participants()
            ->where('status', 'active')
            ->where('last_seen_at', '<', $now->copy()->subSeconds(35))
            ->update(['status' => 'idle']);
    }
}

