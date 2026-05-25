<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReflectionTag extends Model
{
    protected $fillable = [
        'reflection_id',
        'user_id',
        'tag',
    ];

    public function scopeForUser($query, string $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeForReflection($query, string $reflectionId)
    {
        return $query->where('reflection_id', $reflectionId);
    }

    public function scopeByTag($query, string $tag)
    {
        return $query->where('tag', $tag);
    }
}
