import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { LiquidGlassCard } from './utils/helpers';

type Props = { lightMode: boolean };

type FaqCategory = {
    label: string;
    items: {
        question: string;
        answer: string;
    }[];
};

const faqCategories: FaqCategory[] = [
    {
        label: 'Umum',
        items: [
            {
                question: 'Siapa yang mengembangkan Kolabri?',
                answer: 'Kolabri dikembangkan sebagai proyek penelitian mahasiswa di Telkom University, dirancang khusus untuk mendukung pembelajaran kolaboratif di lingkungan perguruan tinggi.',
            },
            {
                question: 'Bagaimana cara memulai menggunakan Kolabri?',
                answer: 'Cukup daftar akun sebagai dosen, buat kelas baru, undang mahasiswa, dan mulai diskusi. Setup bisa dilakukan dalam waktu kurang dari 5 menit.',
            },
            {
                question: 'Berapa jumlah mahasiswa yang bisa ditampung?',
                answer: 'Kolabri dirancang untuk menangani kelas dengan jumlah mahasiswa yang bervariasi, dari kelas kecil hingga kelas besar dengan ratusan mahasiswa.',
            },
        ],
    },
    {
        label: 'Teknis',
        items: [
            {
                question: 'Apakah bisa diintegrasikan dengan LMS yang sudah ada?',
                answer: 'Saat ini Kolabri berjalan sebagai platform mandiri. Integrasi dengan LMS populer seperti Moodle dan Google Classroom ada dalam roadmap pengembangan kami.',
            },
            {
                question: 'Browser apa saja yang didukung?',
                answer: 'Kolabri mendukung semua browser modern termasuk Chrome, Firefox, Safari, dan Edge. Kami merekomendasikan menggunakan versi terbaru untuk pengalaman terbaik.',
            },
            {
                question: 'Apakah Kolabri bisa diakses dari mobile?',
                answer: 'Ya! Kolabri didesain responsive dan bisa diakses dari smartphone dan tablet. Semua fitur utama tersedia di versi mobile.',
            },
        ],
    },
    {
        label: 'Akademik',
        items: [
            {
                question: 'Apa itu analitik SRL?',
                answer: 'SRL (Self-Regulated Learning) adalah kerangka kerja yang mengukur kemampuan mahasiswa dalam mengatur proses belajar mereka sendiri. Kolabri menganalisis 3 dimensi utama: perencanaan, monitoring, dan evaluasi diri.',
            },
            {
                question: 'Bagaimana AI membantu dalam diskusi?',
                answer: 'AI di Kolabri bertindak sebagai fasilitator diskusi yang membantu mengarahkan percakapan, memberikan prompt reflektif, dan mengidentifikasi pola diskusi yang perlu ditingkatkan.',
            },
            {
                question: 'Apakah dosen bisa memantau diskusi secara real-time?',
                answer: 'Ya, dosen memiliki dashboard khusus yang menampilkan aktivitas diskusi secara real-time, termasuk metrik partisipasi dan analitik sentimen.',
            },
        ],
    },
    {
        label: 'Keamanan & Privasi',
        items: [
            {
                question: 'Bagaimana data mahasiswa dilindungi?',
                answer: 'Keamanan data adalah prioritas kami. Semua data dienkripsi dan disimpan secara aman. Kami mengikuti standar keamanan data akademik dan hanya menggunakan data untuk keperluan analitik pembelajaran.',
            },
            {
                question: 'Siapa yang bisa melihat data analitik saya?',
                answer: 'Data analitik hanya dapat diakses oleh dosen pengampu kelas dan admin yang berwenang. Mahasiswa bisa melihat data refleksi diri mereka sendiri.',
            },
        ],
    },
];

export default function FaqSection({ lightMode }: Props) {
    const [activeCategory, setActiveCategory] = useState(0);
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <>
            {/* ========== FAQ SECTION ========== */}
            <section id="faq" className="relative py-32">
                {/* Background glow */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div
                        className="absolute -right-1/4 top-0 h-full w-1/2"
                        style={{
                            background: 'radial-gradient(ellipse at right, rgba(136,22,28,0.04) 0%, rgba(255,255,255,0) 60%)',
                        }}
                    />
                </div>

                <div className="relative mx-auto max-w-4xl px-6">
                    {/* Section header */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                        className="mb-16 text-center"
                    >
                        <span className="mb-4 inline-block text-xl tracking-[0.2em] text-brand-primary uppercase">
                            FAQ
                        </span>
                        <h2
                            className="text-3xl font-light tracking-tight md:text-4xl lg:text-5xl"
                            style={{
                                color: lightMode ? '#4A4A4A' : '#e5e7eb',
                            }}
                        >
                            Pertanyaan yang <span className="text-brand-muted-dark italic">sering ditanyakan</span>
                        </h2>
                        <p className="mx-auto mt-4 max-w-xl text-base text-brand-muted-dark">
                            Temukan jawaban untuk pertanyaan umum seputar Kolabri
                        </p>
                    </motion.div>

                    {/* Category tabs */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="mb-8 flex flex-wrap justify-center gap-2"
                    >
                        {faqCategories.map((cat, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    setActiveCategory(idx);
                                    setOpenIndex(null);
                                }}
                                className="rounded-full px-5 py-2 text-sm font-medium transition-all duration-300"
                                style={{
                                    background: activeCategory === idx
                                        ? 'linear-gradient(135deg, rgba(164,18,25,0.85) 0%, rgba(136,22,28,0.9) 100%)'
                                        : lightMode
                                            ? 'rgba(0,0,0,0.04)'
                                            : 'rgba(255,255,255,0.06)',
                                    color: activeCategory === idx
                                        ? 'white'
                                        : lightMode ? '#4A4A4A' : '#9ca3af',
                                    border: activeCategory === idx
                                        ? '1px solid rgba(255,255,255,0.2)'
                                        : lightMode
                                            ? '1px solid rgba(0,0,0,0.08)'
                                            : '1px solid rgba(255,255,255,0.08)',
                                }}
                            >
                                {cat.label}
                                <span className="ml-1.5 text-xs opacity-60">({cat.items.length})</span>
                            </button>
                        ))}
                    </motion.div>

                    {/* FAQ items */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeCategory}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-4"
                        >
                            {faqCategories[activeCategory].items.map((faq, index) => {
                                const isOpen = openIndex === index;
                                return (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                    >
                                        <LiquidGlassCard className="overflow-hidden !p-0" intensity="light" lightMode={lightMode}>
                                            <button
                                                onClick={() => toggle(index)}
                                                className="flex w-full items-center justify-between p-6 text-left"
                                            >
                                                <span
                                                    className="pr-4 text-base font-medium md:text-lg"
                                                    style={{
                                                        color: lightMode ? '#4A4A4A' : '#e5e7eb',
                                                    }}
                                                >
                                                    {faq.question}
                                                </span>
                                                <motion.div
                                                    animate={{ rotate: isOpen ? 180 : 0 }}
                                                    transition={{ duration: 0.3 }}
                                                    className="flex-shrink-0"
                                                >
                                                    <ChevronDown
                                                        className="h-5 w-5"
                                                        style={{ color: '#88161c' }}
                                                    />
                                                </motion.div>
                                            </button>

                                            <AnimatePresence>
                                                {isOpen && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                                                    >
                                                        <div
                                                            className="px-6 pb-6"
                                                            style={{
                                                                borderTop: lightMode
                                                                    ? '1px solid rgba(0,0,0,0.06)'
                                                                    : '1px solid rgba(255,255,255,0.06)',
                                                            }}
                                                        >
                                                            <p
                                                                className="pt-4 text-sm leading-relaxed md:text-base"
                                                                style={{
                                                                    color: '#6B7280',
                                                                }}
                                                            >
                                                                {faq.answer}
                                                            </p>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </LiquidGlassCard>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </section>
        </>
    );
}
