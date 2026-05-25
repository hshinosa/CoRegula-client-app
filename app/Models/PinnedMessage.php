<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PinnedMessage extends Model
{
    protected $fillable = [
        'message_id',
        'conversation_id',
        'pinned_by',
        'content',
        'sender_name',
        'pinned_at',
    ];

    protected $casts = [
        'pinned_at' => 'datetime',
    ];

    public function scopeForConversation($query, string $conversationId)
    {
        return $query->where('conversation_id', $conversationId);
    }

    public function scopeForMessage($query, string $messageId)
    {
        return $query->where('message_id', $messageId);
    }
}
