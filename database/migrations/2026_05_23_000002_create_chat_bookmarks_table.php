<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('chat_bookmarks', function (Blueprint $table) {
            $table->id();
            $table->string('user_id')->index(); // UUID from Core API, not FK to local users
            $table->string('message_id'); // ID from Core API chat_messages, not FK
            $table->string('conversation_id')->nullable()->index();
            $table->text('note')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'message_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('chat_bookmarks');
    }
};
