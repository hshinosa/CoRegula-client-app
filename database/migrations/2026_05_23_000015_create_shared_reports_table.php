<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shared_reports', function (Blueprint $table) {
            $table->id();
            $table->text('user_id');
            $table->foreign('user_id')->references('id')->on('public.users')->onDelete('cascade');
            $table->string('course_id');
            $table->string('token')->unique();
            $table->string('section');
            $table->string('student_id')->nullable();
            $table->string('metric')->nullable();
            $table->string('start_date')->nullable();
            $table->string('end_date')->nullable();
            $table->timestamp('expires_at');
            $table->timestamps();

            $table->index('token');
            $table->index(['course_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shared_reports');
    }
};
