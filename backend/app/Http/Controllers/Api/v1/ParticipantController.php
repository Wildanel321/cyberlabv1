<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Participant;
use App\Models\SessionEvent;
use App\Services\ActivityService;
use App\Services\ParticipantService;
use App\Services\SessionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ParticipantController extends Controller
{
    public function __construct(
        protected SessionService $sessionService,
        protected ParticipantService $participantService,
        protected ActivityService $activityService,
    ) {}

    /**
     * Join session via room code & nickname without account creation.
     */
    public function join(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => 'required|string|size:6',
            'nickname' => 'required|string|max:40',
        ]);

        $session = $this->sessionService->findJoinableSession($validated['code']);
        $result = $this->participantService->join($session, $validated['nickname']);

        // Log join event
        SessionEvent::create([
            'session_id' => $session->id,
            'event_type' => 'participant.joined',
            'payload' => [
                'nickname' => $result['participant']->nickname,
                'participant_id' => $result['participant']->id,
            ],
            'created_at' => now(),
        ]);

        return response()->json([
            'message' => 'Joined session successfully.',
            'data' => [
                'participant_id' => $result['participant']->id,
                'participant_token' => $result['token'],
                'nickname' => $result['participant']->nickname,
                'session' => [
                    'id' => $session->id,
                    'code' => $session->code,
                    'title' => $session->title,
                    'status' => $session->status,
                    'expires_at' => $session->expires_at->toISOString(),
                ],
            ],
        ], 201);
    }

    /**
     * Heartbeat endpoint to maintain active status.
     */
    public function heartbeat(Request $request): JsonResponse
    {
        /** @var Participant $participant */
        $participant = $request->attributes->get('participant');
        $this->participantService->heartbeat($participant);

        return response()->json([
            'status' => 'acknowledged',
            'last_seen_at' => $participant->last_seen_at->toISOString(),
        ]);
    }

    /**
     * Leave session voluntarily.
     */
    public function leave(Request $request): JsonResponse
    {
        /** @var Participant $participant */
        $participant = $request->attributes->get('participant');
        $this->participantService->leave($participant);

        SessionEvent::create([
            'session_id' => $participant->session_id,
            'event_type' => 'participant.left',
            'payload' => [
                'nickname' => $participant->nickname,
                'participant_id' => $participant->id,
            ],
            'created_at' => now(),
        ]);

        return response()->json([
            'message' => 'Left session successfully.',
        ]);
    }

    /**
     * Submit completed security tool telemetry.
     */
    public function activities(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'tool_name' => 'required|string',
            'risk_tier' => 'required|string|in:LOW,MEDIUM,HIGH,CRITICAL',
            'score' => 'required|integer|min:0|max:100',
            'duration_seconds' => 'required|integer|min:1',
            'metadata' => 'nullable|array',
        ]);

        /** @var Participant $participant */
        $participant = $request->attributes->get('participant');

        $activity = $this->activityService->recordActivity($participant, $validated);

        return response()->json([
            'message' => 'Telemetry recorded successfully.',
            'data' => $activity,
        ], 201);
    }

    /**
     * Retrieve participant's personal activity history for current session.
     */
    public function history(Request $request): JsonResponse
    {
        /** @var Participant $participant */
        $participant = $request->attributes->get('participant');

        $activities = $participant->activities()
            ->latest()
            ->get();

        return response()->json([
            'data' => $activities,
        ]);
    }
}

