<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pinned_messages', function (Blueprint $table) {
            $table->id();
            $table->string('message_id');
            $table->string('conversation_id');
            $table->string('pinned_by');
            $table->text('content');
            $table->string('sender_name');
            $table->timestamp('pinned_at')->useCurrent();
            $table->timestamps();

            $table->unique(['message_id', 'conversation_id']);
            $table->index('conversation_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pinned_messages');
    }
};
