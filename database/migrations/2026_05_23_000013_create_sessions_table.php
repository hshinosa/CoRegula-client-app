<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('learning_sessions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('chat_space_id')->nullable();
            $table->text('created_by');
            $table->string('name');
            $table->text('description')->nullable();
            $table->enum('status', ['draft', 'scheduled', 'active', 'paused', 'closed', 'archived'])->default('draft');
            $table->integer('max_participants')->nullable();
            $table->json('rules')->nullable();
            $table->json('settings')->nullable();

            $table->timestamp('scheduled_at')->nullable();
            $table->timestamp('auto_close_at')->nullable();
            $table->timestamp('last_activity_at')->nullable();
            $table->integer('auto_close_timeout_minutes')->nullable();

            $table->uuid('template_id')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('created_by')->references('id')->on('public.users')->onDelete('cascade');
            $table->index(['status', 'deleted_at']);
            $table->index('scheduled_at');
            $table->index('auto_close_at');
            $table->index('last_activity_at');
            $table->index(['created_by', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('learning_sessions');
    }
};
