<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('activities', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('session_id')->index();
            $table->foreign('session_id')->references('id')->on('training_sessions')->onDelete('cascade');
            $table->uuid('participant_id')->index();
            $table->foreign('participant_id')->references('id')->on('participants')->onDelete('cascade');
            $table->string('tool_name', 64)->index();
            $table->enum('risk_tier', ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])->index();
            $table->unsignedSmallInteger('score')->default(100);
            $table->unsignedInteger('duration_seconds')->default(0);
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['session_id', 'tool_name']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activities');
    }
};
