<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CourseWeek extends Model
{
    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'course_id',
        'week_index',
        'title',
        'sort_order',
    ];

    protected $casts = [
        'week_index' => 'integer',
        'sort_order' => 'integer',
    ];

    public function weekMaterials(): HasMany
    {
        return $this->hasMany(CourseWeekMaterial::class, 'course_week_id');
    }

    public function materials(): BelongsToMany
    {
        return $this->belongsToMany(
            CourseMaterial::class,
            'course_week_materials',
            'course_week_id',
            'course_material_id'
        )->withPivot(['sort_order', 'id'])
            ->orderByPivot('sort_order');
    }
}