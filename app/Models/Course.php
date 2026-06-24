<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';

    protected $table = 'courses';

    protected $fillable = [
        'id', 'code', 'name', 'description', 'owner_id',
    ];

    /**
     * Maps owner_id column to lecturer_id accessor
     * (courses table uses owner_id, controllers use lecturer_id)
     */
    public function getLecturerIdAttribute(): ?string
    {
        return $this->attributes['owner_id'] ?? null;
    }

    public function attendanceSessions()
    {
        return $this->hasMany(AttendanceSession::class, 'course_id', 'id');
    }
}
