<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AiPreset extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'description',
        'department',
        'system_prompt',
        'temperature',
        'max_tokens',
        'model',
        'course_ids',
        'is_shared',
        'is_default',
    ];

    protected $casts = [
        'temperature' => 'float',
        'max_tokens' => 'integer',
        'course_ids' => 'array',
        'is_shared' => 'boolean',
        'is_default' => 'boolean',
    ];

    public function scopeForUser($query, string $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeSharedInDepartment($query, string $department)
    {
        return $query->where('department', $department)
                     ->where('is_shared', true);
    }

    public function scopeVisibleTo($query, string $userId, ?string $department)
    {
        return $query->where(function ($q) use ($userId, $department) {
            $q->where('user_id', $userId);
            if ($department) {
                $q->orWhere(function ($sq) use ($department) {
                    $sq->where('department', $department)
                       ->where('is_shared', true);
                });
            }
        });
    }

    public function scopeDefault($query)
    {
        return $query->where('is_default', true);
    }
}
