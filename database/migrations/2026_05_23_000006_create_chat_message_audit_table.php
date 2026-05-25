<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('chat_message_audit', function (Blueprint $table) {
            $table->id();
            $table->string('message_id');
            $table->string('user_id');
            $table->string('action');
            $table->text('old_content')->nullable();
            $table->text('new_content')->nullable();
            $table->string('conversation_id');
            $table->timestamps();

            $table->index('message_id');
            $table->index('user_id');
            $table->index('conversation_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('chat_message_audit');
    }
};
