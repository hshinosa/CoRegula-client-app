<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChatMessageAudit extends Model
{
    protected $table = 'chat_message_audit';

    protected $fillable = [
        'message_id',
        'user_id',
        'action',
        'old_content',
        'new_content',
        'conversation_id',
    ];

    public function scopeForMessage($query, string $messageId)
    {
        return $query->where('message_id', $messageId);
    }

    public function scopeForConversation($query, string $conversationId)
    {
        return $query->where('conversation_id', $conversationId);
    }

    public function scopeOfType($query, string $action)
    {
        return $query->where('action', $action);
    }
}
