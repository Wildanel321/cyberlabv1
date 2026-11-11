<?php

use App\Http\Controllers\Api\v1\AuthController;
use App\Http\Controllers\Api\v1\InstructorSessionController;
use App\Http\Controllers\Api\v1\ParticipantController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // 1. Instructor Authentication
    Route::prefix('auth')->group(function () {
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login', [AuthController::class, 'login']);

        Route::middleware('auth:sanctum')->group(function () {
            Route::post('/logout', [AuthController::class, 'logout']);
            Route::get('/me', [AuthController::class, 'me']);
        });
    });

    // 2. Instructor Session Management (Sanctum protected)
    Route::middleware('auth:sanctum')->prefix('instructor')->group(function () {
        Route::get('/sessions', [InstructorSessionController::class, 'index']);
        Route::post('/sessions', [InstructorSessionController::class, 'store']);
        Route::get('/sessions/{id}', [InstructorSessionController::class, 'show']);
        Route::post('/sessions/{id}/end', [InstructorSessionController::class, 'end']);
        Route::get('/sessions/{id}/analytics', [InstructorSessionController::class, 'analytics']);
    });

    // 3. Participant Gateway (Zero-friction access)
    Route::prefix('participant')->group(function () {
        Route::post('/join', [ParticipantController::class, 'join']);

        Route::middleware('participant.token')->group(function () {
            Route::post('/heartbeat', [ParticipantController::class, 'heartbeat']);
            Route::post('/leave', [ParticipantController::class, 'leave']);
            Route::post('/activities', [ParticipantController::class, 'activities']);
            Route::get('/history', [ParticipantController::class, 'history']);
        });
    });
});
