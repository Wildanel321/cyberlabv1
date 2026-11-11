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
        Schema::create('session_events', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('session_id')->index();
            $table->foreign('session_id')->references('id')->on('sessions')->onDelete('cascade');
            $table->string('event_type', 64)->index();
            $table->json('payload')->nullable();
            $table->timestamp('created_at')->useCurrent()->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('session_events');
    }
};
