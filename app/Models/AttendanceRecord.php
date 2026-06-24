<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AttendanceRecord extends Model
{
    public $incrementing = false;

    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'id',
        'session_id',
        'student_id',
        'student_name',
        'student_email',
        'status',
        'notes',
        'marked_at',
        'marked_by',
    ];

    protected $casts = [
        'marked_at' => 'datetime',
    ];

    public function session(): BelongsTo
    {
        return $this->belongsTo(AttendanceSession::class, 'session_id');
    }
}
