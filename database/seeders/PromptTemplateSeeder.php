<?php

namespace Database\Seeders;

use App\Models\PromptTemplate;
use Illuminate\Database\Seeder;

class PromptTemplateSeeder extends Seeder
{
    public function run(): void
    {
        $templates = [
            [
                'title' => 'Ringkasan Materi',
                'description' => 'Minta AI merangkum materi kuliah menjadi poin-poin penting',
                'prompt_body' => 'Tolong ringkas materi berikut menjadi poin-poin penting yang mudah dipahami. Sertakan:\n1. Konsep utama\n2. Definisi kunci\n3. Contoh singkat\n\nMateri: [tempel materi di sini]',
                'category' => 'Akademik',
                'is_global' => true,
            ],
            [
                'title' => 'Bantuan Tugas',
                'description' => 'Minta AI membantu menyusun kerangka tugas',
                'prompt_body' => 'Saya perlu bantuan menyusun kerangka tugas untuk mata kuliah [nama mata kuliah].\n\nTopik: [topik tugas]\nBatas kata: [jumlah kata]\n\nTolong buatkan:\n1. Pendahuluan yang menarik\n2. Kerangka isi dengan poin-poin utama\n3. Kesimpulan yang kuat',
                'category' => 'Akademik',
                'is_global' => true,
            ],
            [
                'title' => 'Rencana Belajar',
                'description' => 'Buat jadwal belajar mingguan yang terstruktur',
                'prompt_body' => 'Bantu saya membuat rencana belajar mingguan untuk:\n\nMata kuliah: [daftar mata kuliah]\nUjian/tugas mendatang: [tanggal dan topik]\nWaktu tersedia: [jam per hari]\n\nBuat jadwal yang realistis dengan:\n- Prioritas berdasarkan urgensi\n- Sesi belajar 25-50 menit dengan istirahat\n- Review mingguan di akhir pekan',
                'category' => 'Perencanaan',
                'is_global' => true,
            ],
            [
                'title' => 'Penjelasan Konsep',
                'description' => 'Minta penjelasan konsep sulit dengan analogi sederhana',
                'prompt_body' => 'Jelaskan konsep [nama konsep] dengan cara yang mudah dipahami.\n\nGunakan:\n1. Analogi dari kehidupan sehari-hari\n2. Contoh konkret\n3. Perbedaan dengan konsep serupa yang sering membingungkan\n\nTarget pemahaman: mahasiswa tingkat [tahun] jurusan [jurusan]',
                'category' => 'Akademik',
                'is_global' => true,
            ],
            [
                'title' => 'Diskusi Kelompok',
                'description' => 'Persiapan diskusi kelompok dengan poin-poin yang harus dibahas',
                'prompt_body' => 'Saya akan mengikuti diskusi kelompok tentang [topik].\n\nTolong bantu saya:\n1. Siapkan 3-5 poin diskusi yang bisa saya sampaikan\n2. Antisipasi pertanyaan yang mungkin muncul\n3. Berikan argumen pendukung dengan referensi\n4. Saran cara menyampaikan pendapat dengan efektif',
                'category' => 'Kolaborasi',
                'is_global' => true,
            ],
            [
                'title' => 'Persentase Penelitian',
                'description' => 'Bantuan menyusun presentasi penelitian atau skripsi',
                'prompt_body' => 'Saya perlu mempersiapkan presentasi untuk [judul penelitian/skripsi].\n\nTolong bantu:\n1. Struktur slide yang efektif (10-15 slide)\n2. Poin kunci untuk setiap slide\n3. Cara menjelaskan metodologi dengan jelas\n4. Antisipasi pertanyaan dosen penguji\n5. Tips presentasi yang meyakinkan',
                'category' => 'Penelitian',
                'is_global' => true,
            ],
        ];

        foreach ($templates as $template) {
            PromptTemplate::firstOrCreate(
                ['title' => $template['title'], 'is_global' => true],
                $template
            );
        }
    }
}
