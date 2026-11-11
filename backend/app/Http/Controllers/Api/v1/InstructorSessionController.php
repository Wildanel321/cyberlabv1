<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Session;
use App\Services\AnalyticsService;
use App\Services\ParticipantService;
use App\Services\SessionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InstructorSessionController extends Controller
{
    public function __construct(
        protected SessionService $sessionService,
        protected AnalyticsService $analyticsService,
        protected ParticipantService $participantService,
    ) {}

    /**
     * List sessions owned by the authenticated instructor.
     */
    public function index(Request $request): JsonResponse
    {
        $sessions = Session::where('user_id', $request->user()->id)
            ->withCount(['participants as total_participants_count'])
            ->latest()
            ->get();

        return response()->json([
            'data' => $sessions,
        ]);
    }

    /**
     * Create a new training room session.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'max_participants' => 'nullable|integer|min:5|max:500',
            'expires_in_minutes' => 'nullable|integer|min:15|max:1440',
        ]);

        $session = $this->sessionService->createSession($request->user(), $validated);

        return response()->json([
            'message' => 'Training session created successfully.',
            'data' => $session,
        ], 201);
    }

    /**
     * Get specific session details (scoped to owner).
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $session = Session::where('user_id', $request->user()->id)
            ->where('id', $id)
            ->firstOrFail();

        return response()->json([
            'data' => $session,
        ]);
    }

    /**
     * Terminate an active session.
     */
    public function end(Request $request, string $id): JsonResponse
    {
        $session = Session::where('user_id', $request->user()->id)
            ->where('id', $id)
            ->firstOrFail();

        $endedSession = $this->sessionService->endSession($session, $request->user());

        return response()->json([
            'message' => 'Session ended successfully.',
            'data' => $endedSession,
        ]);
    }

    /**
     * Return live aggregated analytics for session.
     */
    public function analytics(Request $request, string $id): JsonResponse
    {
        $session = Session::where('user_id', $request->user()->id)
            ->where('id', $id)
            ->firstOrFail();

        $this->participantService->updateStatusesForSession($session);

        $analytics = $this->analyticsService->getSessionAnalytics($session);

        return response()->json([
            'data' => $analytics,
        ]);
    }
}

