<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserPreference extends Model
{
    protected $fillable = [
        'user_id',
        'notifications_email',
        'notifications_push',
        'notifications_tasks',
        'notifications_chat',
        'notifications_groups',
        'analytics_visibility',
        'ai_interaction_consent',
        'data_sharing_consent',
        'language',
        'theme',
        'font_size',
    ];

    protected function casts(): array
    {
        return [
            'notifications_email' => 'boolean',
            'notifications_push' => 'boolean',
            'notifications_tasks' => 'boolean',
            'notifications_chat' => 'boolean',
            'notifications_groups' => 'boolean',
            'analytics_visibility' => 'boolean',
            'ai_interaction_consent' => 'boolean',
            'data_sharing_consent' => 'boolean',
        ];
    }

    public static function defaultsFor(string $userId): array
    {
        return [
            'user_id' => $userId,
            'notifications_email' => true,
            'notifications_push' => true,
            'notifications_tasks' => true,
            'notifications_chat' => true,
            'notifications_groups' => true,
            'language' => 'id',
            'theme' => 'light',
            'font_size' => 'normal',
        ];
    }

    public function toResponseArray(): array
    {
        return [
            'notifications' => [
                'email' => $this->notifications_email,
                'push' => $this->notifications_push,
                'tasks' => $this->notifications_tasks,
                'chat' => $this->notifications_chat,
                'groups' => $this->notifications_groups,
            ],
            'language' => $this->language,
            'theme' => $this->theme,
            'font_size' => $this->font_size,
        ];
    }
}
