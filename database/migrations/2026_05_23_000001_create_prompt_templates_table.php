<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('prompt_templates', function (Blueprint $table) {
            $table->id();
            $table->string('user_id')->nullable()->index(); // NULL = global template; UUID from Core API, not FK
            $table->string('title');
            $table->text('description')->nullable();
            $table->longText('prompt_body');
            $table->string('category')->nullable()->index();
            $table->boolean('is_global')->default(false);
            $table->timestamps();

            $table->index(['user_id', 'is_global']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('prompt_templates');
    }
};
