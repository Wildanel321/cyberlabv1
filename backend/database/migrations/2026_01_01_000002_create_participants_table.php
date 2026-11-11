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
        Schema::create('participants', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('session_id')->index();
            $table->foreign('session_id')->references('id')->on('sessions')->onDelete('cascade');
            $table->string('nickname', 64);
            $table->char('token_hash', 64)->index();
            $table->enum('status', ['active', 'idle', 'disconnected'])->default('active')->index();
            $table->timestamp('last_seen_at')->useCurrent()->index();
            $table->timestamps();

            $table->index(['session_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('participants');
    }
};
