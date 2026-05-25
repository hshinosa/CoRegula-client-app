<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('session_templates', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->text('description')->nullable();
            $table->text('created_by');
            $table->json('configuration')->nullable(); // stores max_participants, rules, settings, auto_close_timeout
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('created_by')->references('id')->on('public.users')->onDelete('cascade');
            $table->index(['created_by', 'deleted_at']);
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('session_templates');
    }
};
