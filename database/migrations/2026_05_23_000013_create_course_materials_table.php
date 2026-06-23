<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('course_materials')) {
            Schema::create('course_materials', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('course_id')->index();
                $table->string('title');
                $table->text('description')->nullable();
                $table->string('file_name');
                $table->string('file_path');
                $table->string('file_type')->nullable();
                $table->unsignedBigInteger('file_size')->default(0);
                $table->uuid('uploaded_by')->nullable();
                $table->integer('view_count')->default(0);
                $table->integer('sort_order')->default(0);
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('material_views')) {
            Schema::create('material_views', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->text('material_id');
                $table->uuid('student_id');
                $table->timestamp('viewed_at')->useCurrent();
                $table->timestamps();
                $table->index(['material_id', 'student_id']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('material_views');
        Schema::dropIfExists('course_materials');
    }
};
