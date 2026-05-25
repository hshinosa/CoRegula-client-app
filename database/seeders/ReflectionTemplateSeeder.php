<?php

namespace Database\Seeders;

use App\Models\ReflectionTemplate;
use Illuminate\Database\Seeder;

class ReflectionTemplateSeeder extends Seeder
{
    public function run(): void
    {
        $templates = [
            [
                'title' => 'Refleksi Harian',
                'description' => 'Evaluasi singkat aktivitas dan pembelajaran hari ini',
                'content_template' => "## Refleksi Hari Ini\n\n### Apa yang saya pelajari hari ini?\n\n\n### Apa tantangan yang saya hadapi?\n\n\n### Bagaimana saya mengatasinya?\n\n\n### Apa yang akan saya lakukan berbeda besok?\n\n",
                'category' => 'Harian',
                'is_global' => true,
            ],
            [
                'title' => 'Refleksi Mingguan',
                'description' => 'Rangkuman pembelajaran dan pencapaian selama seminggu',
                'content_template' => "## Refleksi Mingguan\n\n### Pencapaian minggu ini\n\n\n### Tantangan utama\n\n\n### Pelajaran yang didapat\n\n\n### Target minggu depan\n\n\n### Skala kepuasan (1-10):\n\n",
                'category' => 'Mingguan',
                'is_global' => true,
            ],
            [
                'title' => 'Refleksi Proyek',
                'description' => 'Evaluasi progres dan pembelajaran dari proyek yang sedang dikerjakan',
                'content_template' => "## Refleksi Proyek\n\n### Nama Proyek:\n\n\n### Progres yang sudah dibuat\n\n\n### Hambatan yang dihadapi\n\n\n### Kontribusi anggota tim\n\n\n### Pelajaran untuk proyek selanjutnya\n\n\n### Langkah selanjutnya\n\n",
                'category' => 'Proyek',
                'is_global' => true,
            ],
            [
                'title' => 'Evaluasi Diri',
                'description' => 'Penilaian mendalam terhadap kemampuan dan pengembangan diri',
                'content_template' => "## Evaluasi Diri\n\n### Kekuatan yang saya tunjukkan\n\n\n### Area yang perlu ditingkatkan\n\n\n### Keterampilan baru yang saya kuasai\n\n\n### Umpan balik yang saya terima\n\n\n### Rencana pengembangan diri\n\n\n### Skala kemajuan (1-10):\n\n",
                'category' => 'Evaluasi Diri',
                'is_global' => true,
            ],
        ];

        foreach ($templates as $template) {
            ReflectionTemplate::firstOrCreate(
                ['title' => $template['title'], 'is_global' => true],
                $template
            );
        }
    }
}
