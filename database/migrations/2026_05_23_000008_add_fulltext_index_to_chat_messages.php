<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (config('database.default') === 'sqlite') {
            return;
        }

        try {
            Schema::table('chat_messages', function (Blueprint $table) {
                $table->fullText('content');
            });
        } catch (\Throwable) {
            // Index may already exist from Prisma migration
        }
    }

    public function down(): void
    {
        if (config('database.default') === 'sqlite') {
            return;
        }

        Schema::table('chat_messages', function (Blueprint $table) {
            $table->dropFullText(['content']);
        });
    }
};
