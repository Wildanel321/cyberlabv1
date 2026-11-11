<?php

namespace App\Http\Middleware;

use App\Services\ParticipantService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifyParticipantToken
{
    public function __construct(
        protected ParticipantService $participantService
    ) {}

    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->header('X-Participant-Token');

        if (!$token) {
            return response()->json([
                'message' => 'Missing participant authorization token.',
            ], 401);
        }

        $participant = $this->participantService->resolveParticipantFromToken($token);

        if (!$participant) {
            return response()->json([
                'message' => 'Invalid or expired participant token.',
            ], 401);
        }

        // Attach participant to request
        $request->attributes->set('participant', $participant);

        return $next($request);
    }
}

