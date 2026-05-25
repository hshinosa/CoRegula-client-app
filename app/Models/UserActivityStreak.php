<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class UserActivityStreak extends Model
{
    protected $table = 'user_activity_streak';

    protected $fillable = ['user_id', 'activity_date'];

    protected function casts(): array
    {
        return [
            'activity_date' => 'date',
        ];
    }

    public static function recordActivity(string $userId): void
    {
        self::updateOrCreate(
            ['user_id' => $userId, 'activity_date' => Carbon::today()],
            ['user_id' => $userId, 'activity_date' => Carbon::today()]
        );
    }

    public static function calculateStreak(string $userId): int
    {
        $dates = self::where('user_id', $userId)
            ->orderBy('activity_date', 'desc')
            ->pluck('activity_date')
            ->map(fn($d) => Carbon::parse($d)->format('Y-m-d'));

        if ($dates->isEmpty()) {
            return 0;
        }

        $today = Carbon::today()->format('Y-m-d');
        $yesterday = Carbon::yesterday()->format('Y-m-d');

        if ($dates->first() !== $today && $dates->first() !== $yesterday) {
            return 0;
        }

        $streak = 1;
        $expectedDate = Carbon::parse($dates->first())->subDay()->format('Y-m-d');

        for ($i = 1; $i < $dates->count(); $i++) {
            if ($dates[$i] === $expectedDate) {
                $streak++;
                $expectedDate = Carbon::parse($expectedDate)->subDay()->format('Y-m-d');
            } else {
                break;
            }
        }

        return $streak;
    }
}
