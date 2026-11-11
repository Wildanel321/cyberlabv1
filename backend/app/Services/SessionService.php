<?php

namespace App\Services;

use App\Models\Session;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class SessionService
{
    /**
     * Generate a unique 6-character room code.
     */
    public function generateUniqueCode(): string
    {
        // Safe characters excluding easily confused glyphs (0, O, 1, I)
        $characters = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
        $maxAttempts = 20;

        for ($i = 0; $i < $maxAttempts; $i++) {
            $code = '';
            for ($c = 0; $c < 6; $c++) {
                $code .= $characters[random_int(0, strlen($characters) - 1)];
            }

            if (!Session::where('code', $code)->exists()) {
                return $code;
            }
        }

        return strtoupper(Str::random(6));
    }

    /**
     * Create a new training session for instructor.
     */
    public function createSession(User $user, array $data): Session
    {
        $code = $this->generateUniqueCode();
        $expiresMinutes = $data['expires_in_minutes'] ?? 120;

        return Session::create([
            'user_id' => $user->id,
            'code' => $code,
            'title' => $data['title'] ?? 'Cybersecurity Training Session',
            'status' => 'active',
            'max_participants' => min(500, max(5, $data['max_participants'] ?? 50)),
            'expires_at' => Carbon::now()->addMinutes($expiresMinutes),
        ]);
    }

    /**
     * Terminate an active session.
     */
    public function endSession(Session $session, User $user): Session
    {
        if ($session->user_id !== $user->id) {
            throw ValidationException::withMessages(['session' => 'Unauthorized action.']);
        }

        $session->update(['status' => 'ended']);
        return $session;
    }

    /**
     * Find session by room code and validate join eligibility.
     */
    public function findJoinableSession(string $code): Session
    {
        $session = Session::where('code', strtoupper(trim($code)))->first();

        if (!$session) {
            throw ValidationException::withMessages(['code' => 'Session code does not exist.']);
        }

        if ($session->isExpired()) {
            if ($session->status !== 'expired') {
                $session->update(['status' => 'expired']);
            }
            throw ValidationException::withMessages(['code' => 'This training session has expired.']);
        }

        if ($session->status === 'ended') {
            throw ValidationException::withMessages(['code' => 'This training session has ended.']);
        }

        if ($session->status !== 'active') {
            throw ValidationException::withMessages(['code' => 'This training session is not currently active.']);
        }

        // Check participant capacity
        $currentParticipants = $session->participants()->count();
        if ($currentParticipants >= $session->max_participants) {
            throw ValidationException::withMessages(['code' => 'Room has reached maximum participant limit.']);
        }

        return $session;
    }
}

