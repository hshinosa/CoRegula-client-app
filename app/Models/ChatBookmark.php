<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChatBookmark extends Model
{
    protected $fillable = [
        'user_id',
        'message_id',
        'conversation_id',
        'note',
    ];

    public function scopeForUser($query, string $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeForConversation($query, string $conversationId)
    {
        return $query->where('conversation_id', $conversationId);
    }

    public function scopeForMessage($query, string $messageId)
    {
        return $query->where('message_id', $messageId);
    }
}
