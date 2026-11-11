<?php

namespace App\Services;

use App\Models\Activity;
use App\Models\Participant;
use App\Models\Session;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AnalyticsService
{
    private const TOOL_DISPLAY_NAMES = [
        'password_checker' => 'Password Checker',
        'phishing_analyzer' => 'Phishing Analyzer',
        'data_leak' => 'Personal Data Leak',
        'ai_privacy' => 'AI Privacy Scanner',
        'two_factor' => '2FA Simulator',
        'cloud_security' => 'Cloud Storage & IAM',
    ];

    /**
     * Compute comprehensive real-time analytics for an instructor's session.
     */
    public function getSessionAnalytics(Session $session): array
    {
        // 1. Participant metrics
        $totalParticipants = $session->participants()->count();
        $activeCutoff = Carbon::now()->subSeconds(45);
        $activeParticipants = $session->participants()
            ->where('status', 'active')
            ->where('last_seen_at', '>=', $activeCutoff)
            ->count();

        // 2. Activity metrics
        $activities = $session->activities();
        $totalActivities = $activities->count();
        $avgScore = $totalActivities > 0 ? (int) round($activities->avg('score')) : 100;

        // 3. Tool usage breakdown
        $toolStats = DB::table('activities')
            ->where('session_id', $session->id)
            ->select('tool_name', DB::raw('count(*) as count'), DB::raw('round(avg(score)) as avg_score'))
            ->groupBy('tool_name')
            ->get();

        $toolUsage = [];
        foreach (self::TOOL_DISPLAY_NAMES as $toolKey => $displayName) {
            $stat = $toolStats->firstWhere('tool_name', $toolKey);
            $toolUsage[] = [
                'tool_name' => $toolKey,
                'display_name' => $displayName,
                'count' => $stat ? (int) $stat->count : 0,
                'avg_score' => $stat ? (int) $stat->avg_score : 100,
            ];
        }

        // 4. Risk distribution
        $riskStats = DB::table('activities')
            ->where('session_id', $session->id)
            ->select('risk_tier', DB::raw('count(*) as count'))
            ->groupBy('risk_tier')
            ->pluck('count', 'risk_tier')
            ->toArray();

        $riskDistribution = [];
        $tiers = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
        foreach ($tiers as $tier) {
            $count = $riskStats[$tier] ?? 0;
            $percentage = $totalActivities > 0 ? (int) round(($count / $totalActivities) * 100) : 0;
            $riskDistribution[] = [
                'tier' => $tier,
                'count' => (int) $count,
                'percentage' => $percentage,
            ];
        }

        // 5. Recent completed activities feed
        $recentActivities = Activity::with('participant:id,nickname')
            ->where('session_id', $session->id)
            ->latest()
            ->take(20)
            ->get()
            ->map(function ($act) {
                return [
                    'id' => $act->id,
                    'tool_name' => self::TOOL_DISPLAY_NAMES[$act->tool_name] ?? $act->tool_name,
                    'nickname' => $act->participant?->nickname ?? 'Anonymous',
                    'risk_tier' => $act->risk_tier,
                    'score' => $act->score,
                    'created_at' => $act->created_at->toISOString(),
                ];
            });

        // 6. Activity timeline (cumulative or recent)
        $timeline = Activity::where('session_id', $session->id)
            ->latest()
            ->take(15)
            ->get()
            ->reverse()
            ->map(function ($act) {
                return [
                    'time' => $act->created_at->format('H:i'),
                    'count' => 1,
                ];
            })->values();

        return [
            'session_id' => $session->id,
            'session_code' => $session->code,
            'session_title' => $session->title,
            'session_status' => $session->status,
            'total_participants' => $totalParticipants,
            'active_participants' => $activeParticipants,
            'total_activities_completed' => $totalActivities,
            'average_security_score' => $avgScore,
            'tool_usage' => $toolUsage,
            'risk_distribution' => $riskDistribution,
            'recent_activities' => $recentActivities,
            'activity_timeline' => $timeline,
        ];
    }
}

