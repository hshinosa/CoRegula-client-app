<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserAvatar extends Model
{
    protected $fillable = [
        'user_id',
        'original_path',
        'thumbnail_path',
        'medium_path',
        'large_path',
        'original_filename',
        'mime_type',
        'file_size',
    ];

    public function getUrls(): array
    {
        return [
            'thumbnail' => $this->thumbnail_path ? asset('storage/' . $this->thumbnail_path) : null,
            'medium' => $this->medium_path ? asset('storage/' . $this->medium_path) : null,
            'large' => $this->large_path ? asset('storage/' . $this->large_path) : null,
        ];
    }
}
