<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_presets', function (Blueprint $table) {
            $table->id();
            $table->string('user_id')->index();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('department')->nullable()->index();
            $table->longText('system_prompt');
            $table->float('temperature')->default(0.7);
            $table->integer('max_tokens')->default(1024);
            $table->string('model')->nullable();
            $table->json('course_ids')->nullable();
            $table->boolean('is_shared')->default(false);
            $table->boolean('is_default')->default(false);
            $table->timestamps();

            $table->index(['user_id', 'is_shared']);
            $table->index(['department', 'is_shared']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_presets');
    }
};
