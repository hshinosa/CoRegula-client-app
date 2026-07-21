/**
 * Penjelasan metrik analitik untuk dosen.
 * Teks sengaja panjang dan non-teknis agar dosen umum mudah memahami.
 */

export const RADAR_METRIC_LABELS: string[] = [
    'Hot',
    'Lexical Variety',
    'Forethought',
    'Performance',
    'Collaboration',
    'Reflection',
];

export const RADAR_METRIC_DEFINITIONS: Record<string, string> = {
    Hot:
        'Seberapa sering diskusi memuat analisis, evaluasi, atau penalaran tingkat tinggi.',

    'Lexical Variety':
        'Seberapa beragam kosakata dan istilah yang dipakai dalam diskusi.',

    Forethought:
        'Seberapa terlihat perencanaan, penetapan arah, atau strategi sebelum eksekusi.',

    Performance:
        'Ringkasan mutu eksekusi diskusi: relevansi, fokus, dan kontribusi terhadap progres tugas.',

    Collaboration:
        'Seberapa aktif anggota saling merespons, membangun ide, dan bekerja sebagai tim.',

    Reflection:
        'Seberapa sering diskusi memuat evaluasi proses, rangkuman pelajaran, atau tindak lanjut.',
};

export const QUALITY_METRIC_EXPLANATIONS: Record<string, string> = {
    'HOT Thinking':
        'Proporsi pesan yang menunjukkan analisis, evaluasi, atau sintesis ide.',

    'Lexical Variety':
        'Keragaman kosakata dan istilah yang muncul dalam percakapan.',

    Participants:
        'Jumlah peserta yang terdeteksi aktif berkontribusi dalam diskusi.',

    'Quality Score':
        'Ringkasan cepat mutu diskusi secara keseluruhan.',

    'Total Pesan':
        'Jumlah pesan yang dianalisis dalam cakupan data ini.',
};

export const METRIC_LABEL_EXPLANATIONS: Record<string, string> = {
    Engagement:
        'Sinyal keterlibatan belajar dalam percakapan.',
};

export const ENGAGEMENT_TYPE_EXPLANATIONS: Record<string, string> = {
    cognitive:
        'Fokus pada analisis, pemahaman konsep, dan penalaran.',

    behavioral:
        'Fokus pada tindakan, koordinasi, dan eksekusi tugas.',

    emotional:
        'Fokus pada dukungan, apresiasi, atau empati antarpeserta.',

    social:
        'Fokus pada relasi, kohesi, dan respons sosial dalam kelompok.',
};
