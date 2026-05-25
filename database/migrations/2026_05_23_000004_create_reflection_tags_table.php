<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reflection_tags', function (Blueprint $table) {
            $table->id();
            $table->string('reflection_id')->index();
            $table->string('user_id')->index();
            $table->string('tag', 100)->index();
            $table->timestamps();

            $table->unique(['reflection_id', 'tag']);
            $table->index(['user_id', 'tag']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reflection_tags');
    }
};
