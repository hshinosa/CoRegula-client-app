<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('course_weeks')) {
            Schema::create('course_weeks', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('course_id')->index();
                $table->unsignedInteger('week_index');
                $table->string('title');
                $table->integer('sort_order')->default(0);
                $table->timestamps();

                $table->unique(['course_id', 'week_index']);
            });
        }

        if (!Schema::hasTable('course_week_materials')) {
            Schema::create('course_week_materials', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('course_week_id');
                $table->uuid('course_material_id');
                $table->integer('sort_order')->default(0);
                $table->timestamps();

                $table->foreign('course_week_id')->references('id')->on('course_weeks')->cascadeOnDelete();
                $table->foreign('course_material_id')->references('id')->on('course_materials')->cascadeOnDelete();
                $table->unique(['course_week_id', 'course_material_id']);
                $table->index(['course_week_id', 'sort_order']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('course_week_materials');
        Schema::dropIfExists('course_weeks');
    }
};