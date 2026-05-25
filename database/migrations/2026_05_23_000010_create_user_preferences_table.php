<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_preferences', function (Blueprint $table) {
            $table->id();
            $table->uuid('user_id')->unique();
            $table->boolean('notifications_email')->default(true);
            $table->boolean('notifications_push')->default(true);
            $table->boolean('notifications_tasks')->default(true);
            $table->boolean('notifications_chat')->default(true);
            $table->boolean('notifications_groups')->default(true);
            $table->string('language', 10)->default('id');
            $table->string('theme', 20)->default('system');
            $table->string('font_size', 20)->default('normal');
            $table->timestamps();

            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_preferences');
    }
};
