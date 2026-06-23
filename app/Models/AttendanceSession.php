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
        'session_discussion_id',
        'week_id',
        'group_id',
        'title',
        'session_date',
        'session_number',
        'auto_generated',
        'attendance_method',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'session_date' => 'date',
        'session_number' => 'integer',
        'auto_generated' => 'boolean',
    ];

    public function records(): HasMany
    {
        return $this->hasMany(AttendanceRecord::class, 'session_id');
    }

    public function course()
    {
        return $this->belongsTo(\App\Models\Course::class, 'course_id');
    }
}
