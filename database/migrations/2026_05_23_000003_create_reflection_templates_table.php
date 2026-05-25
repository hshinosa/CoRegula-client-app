<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reflection_templates', function (Blueprint $table) {
            $table->id();
            $table->string('user_id')->nullable()->index();
            $table->string('title');
            $table->text('description')->nullable();
            $table->longText('content_template');
            $table->string('category')->nullable()->index();
            $table->boolean('is_global')->default(false);
            $table->timestamps();

            $table->index(['user_id', 'is_global']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reflection_templates');
    }
};
