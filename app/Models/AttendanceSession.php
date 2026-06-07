<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AttendanceSession extends Model
{
    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'course_id',
        'title',
        'session_date',
        'session_number',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'session_date' => 'date',
        'session_number' => 'integer',
    ];

    public function records(): HasMany
    {
        return $this->hasMany(AttendanceRecord::class, 'session_id');
    }
}
