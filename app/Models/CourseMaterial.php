<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CourseMaterial extends Model
{
    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'course_id',
        'title',
        'description',
        'file_name',
        'file_path',
        'file_type',
        'file_size',
        'uploaded_by',
        'view_count',
        'sort_order',
    ];

    protected $casts = [
        'file_size' => 'integer',
        'view_count' => 'integer',
        'sort_order' => 'integer',
    ];

    public function module(): BelongsTo
    {
        return $this->belongsTo(MaterialModule::class, 'module_id');
    }

    public function weeks(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(
            CourseWeek::class,
            'course_week_materials',
            'course_material_id',
            'course_week_id'
        )->withPivot(['sort_order', 'id']);
    }

    public function views(): HasMany
    {
        return $this->hasMany(MaterialView::class, 'material_id');
    }
}
