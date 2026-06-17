import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { LiquidGlassCard, useReducedMotion } from './utils/helpers';

type Props = { lightMode: boolean };

interface Testimonial {
    id: number;
    name: string;
    role: string;
    university: string;
    avatar: string;
    rating: number;
    quote: string;
}

const testimonials: Testimonial[] = [
    {
        id: 1,
        name: 'Rina Wijaya',
        role: 'Mahasiswa Teknik Informatika',
        university: 'Telkom University',
        avatar: '👩‍💻',
        rating: 5,
        quote: 'Kolabri mengubah cara saya berdiskusi dengan teman satu kelompok. AI-nya membantu kami tetap fokus dan tidak melenceng dari topik. Analitiknya juga membantu saya sadar kapan saya kurang aktif.',
    },
    {
        id: 2,
        name: 'Dr. Ahmad Fauzi',
        role: 'Dosen Sistem Informasi',
        university: 'Telkom University',
        avatar: '👨‍🏫',
        rating: 5,
        quote: 'Sebagai dosen, saya bisa melihat pola diskusi mahasiswa secara real-time. Dashboard analitiknya sangat membantu untuk mengidentifikasi kelompok yang butuh intervensi. Sangat recommended untuk pembelajaran kolaboratif.',
    },
    {
        id: 3,
        name: 'Siti Nurhaliza',
        role: 'Mahasiswa Manajemen',
        university: 'Telkom University',
        avatar: '👩‍🎓',
        rating: 4,
        quote: 'Fitur refleksi di Kolabri membantu saya mengevaluasi proses belajar sendiri. Saya jadi lebih aware dengan gaya belajar saya dan bisa mengatur strategi belajar yang lebih efektif.',
    },
    {
        id: 4,
        name: 'Budi Santoso',
        role: 'Asisten Dosen',
        university: 'Telkom University',
        avatar: '👨‍💻',
        rating: 5,
        quote: 'Monitoring diskusi kelompok jadi jauh lebih mudah. Saya bisa langsung tahu kelompok mana yang aktif dan mana yang perlu dorongan. Fitur AI prompting-nya juga sangat cerdas.',
    },
    {
        id: 5,
        name: 'Dewi Kartika',
        role: 'Mahasiswa Pendidikan',
        university: 'Telkom University',
        avatar: '👩‍📚',
        rating: 5,
        quote: 'Sebagai mahasiswa jurusan pendidikan, saya sangat mengapresiasi pendekatan SRL yang diterapkan Kolabri. Platform ini benar-benar dirancang berdasarkan riset akademik yang solid.',
    },
];

export default function TestimonialsSection({ lightMode }: Props) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);
    const prefersReducedMotion = useReducedMotion();

    const paginate = useCallback(
        (newDirection: number) => {
            setDirection(newDirection);
            setCurrentIndex((prev) => {
                const next = prev + newDirection;
                if (next < 0) return testimonials.length - 1;
                if (next >= testimonials.length) return 0;
                return next;
            });
        },
        [],
    );

    // Auto-advance every 6s
    useEffect(() => {
        const timer = setInterval(() => paginate(1), 6000);
        return () => clearInterval(timer);
    }, [paginate]);

    const variants = {
        enter: (dir: number) => ({
            x: dir > 0 ? 300 : -300,
            opacity: 0,
            scale: 0.95,
        }),
        center: {
            x: 0,
            opacity: 1,
            scale: 1,
        },
        exit: (dir: number) => ({
            x: dir < 0 ? 300 : -300,
            opacity: 0,
            scale: 0.95,
        }),
    };

    const current = testimonials[currentIndex];

    return (
        <>
            {/* ========== TESTIMONIALS SECTION ========== */}
            <section id="testimoni" className="relative py-32">
                {/* Decorative blobs */}
                <motion.div
                    animate={
                        prefersReducedMotion
                            ? { y: 0 }
                            : { y: [0, -25, 0] }
                    }
                    transition={
                        prefersReducedMotion
                            ? { duration: 0.3 }
                            : { duration: 9, repeat: Infinity, ease: 'easeInOut' }
                    }
                    className="pointer-events-none absolute top-20 left-1/4 h-72 w-72 rounded-full opacity-20 blur-3xl"
                    style={{ background: lightMode ? 'rgba(136,22,28,0.06)' : 'rgba(164,18,25,0.12)' }}
                />
                <motion.div
                    animate={
                        prefersReducedMotion
                            ? { y: 0 }
                            : { y: [0, 20, 0] }
                    }
                    transition={
                        prefersReducedMotion
                            ? { duration: 0.3 }
                            : { duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 2 }
                    }
                    className="pointer-events-none absolute bottom-20 right-1/4 h-64 w-64 rounded-full opacity-20 blur-3xl"
                    style={{ background: lightMode ? 'rgba(30,58,138,0.05)' : 'rgba(30,58,138,0.1)' }}
                />

                <div className="relative mx-auto max-w-7xl px-6">
                    {/* Section header */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                        className="mb-16 text-center"
                    >
                        <span className="mb-4 inline-block text-xl tracking-[0.2em] text-brand-primary uppercase">
                            Testimoni
                        </span>
                        <h2
                            className="text-3xl font-light tracking-tight md:text-4xl lg:text-5xl"
                            style={{
                                color: lightMode ? '#4A4A4A' : '#e5e7eb',
                            }}
                        >
                            Apa kata <span className="text-brand-muted-dark italic">mereka</span>
                        </h2>
                        <p className="mx-auto mt-4 max-w-xl text-base text-brand-muted-dark">
                            Pengalaman nyata dari pengguna Kolabri di lingkungan akademik
                        </p>
                    </motion.div>

                    {/* Carousel */}
                    <div className="relative mx-auto max-w-3xl">
                        <LiquidGlassCard className="p-8 md:p-12" intensity="medium" lightMode={lightMode}>
                            <div className="relative overflow-hidden" style={{ minHeight: '280px' }}>
                                <AnimatePresence initial={false} custom={direction} mode="wait">
                                    <motion.div
                                        key={current.id}
                                        custom={direction}
                                        variants={variants}
                                        initial="enter"
                                        animate="center"
                                        exit="exit"
                                        transition={{
                                            x: { type: 'spring', stiffness: 300, damping: 30 },
                                            opacity: { duration: 0.25 },
                                            scale: { duration: 0.25 },
                                        }}
                                        className="flex flex-col items-center text-center"
                                    >
                                        {/* Quote icon */}
                                        <div
                                            className="mb-6 flex h-12 w-12 items-center justify-center rounded-full"
                                            style={{
                                                background: lightMode
                                                    ? 'rgba(136,22,28,0.08)'
                                                    : 'rgba(164,18,25,0.15)',
                                            }}
                                        >
                                            <Quote
                                                className="h-5 w-5"
                                                style={{ color: '#88161c' }}
                                            />
                                        </div>

                                        {/* Quote text */}
                                        <p
                                            className="mb-8 text-lg leading-relaxed md:text-xl"
                                            style={{
                                                color: lightMode ? '#4A4A4A' : '#d1d5db',
                                            }}
                                        >
                                            &ldquo;{current.quote}&rdquo;
                                        </p>

                                        {/* Rating */}
                                        <div className="mb-4 flex gap-1">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className="h-4 w-4"
                                                    fill={i < current.rating ? '#f59e0b' : 'transparent'}
                                                    stroke={i < current.rating ? '#f59e0b' : '#9ca3af'}
                                                    strokeWidth={1.5}
                                                />
                                            ))}
                                        </div>

                                        {/* Avatar + Info */}
                                        <div className="flex items-center gap-4">
                                            <div
                                                className="flex h-14 w-14 items-center justify-center rounded-full text-2xl"
                                                style={{
                                                    background: lightMode
                                                        ? 'linear-gradient(135deg, rgba(136,22,28,0.1) 0%, rgba(136,22,28,0.05) 100%)'
                                                        : 'linear-gradient(135deg, rgba(164,18,25,0.2) 0%, rgba(164,18,25,0.1) 100%)',
                                                    border: '1px solid rgba(136,22,28,0.12)',
                                                }}
                                            >
                                                {current.avatar}
                                            </div>
                                            <div className="text-left">
                                                <p
                                                    className="font-semibold"
                                                    style={{
                                                        color: lightMode ? '#4A4A4A' : '#e5e7eb',
                                                    }}
                                                >
                                                    {current.name}
                                                </p>
                                                <p className="text-sm text-brand-muted-dark">
                                                    {current.role}
                                                </p>
                                                <p className="text-xs text-gray-600">
                                                    {current.university}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            {/* Navigation arrows */}
                            <div className="mt-6 flex items-center justify-center gap-4">
                                <button
                                    onClick={() => paginate(-1)}
                                    className="flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 hover:scale-110"
                                    style={{
                                        background: lightMode
                                            ? 'rgba(136,22,28,0.08)'
                                            : 'rgba(164,18,25,0.15)',
                                        border: '1px solid rgba(136,22,28,0.12)',
                                    }}
                                    aria-label="Testimoni sebelumnya"
                                >
                                    <ChevronLeft className="h-5 w-5" style={{ color: '#88161c' }} />
                                </button>

                                {/* Dots */}
                                <div className="flex gap-2">
                                    {testimonials.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                setDirection(idx > currentIndex ? 1 : -1);
                                                setCurrentIndex(idx);
                                            }}
                                            className="h-2 rounded-full transition-all duration-300"
                                            style={{
                                                width: idx === currentIndex ? '24px' : '8px',
                                                background:
                                                    idx === currentIndex
                                                        ? '#88161c'
                                                        : lightMode
                                                            ? 'rgba(136,22,28,0.2)'
                                                            : 'rgba(164,18,25,0.3)',
                                            }}
                                            aria-label={`Testimoni ${idx + 1}`}
                                        />
                                    ))}
                                </div>

                                <button
                                    onClick={() => paginate(1)}
                                    className="flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 hover:scale-110"
                                    style={{
                                        background: lightMode
                                            ? 'rgba(136,22,28,0.08)'
                                            : 'rgba(164,18,25,0.15)',
                                        border: '1px solid rgba(136,22,28,0.12)',
                                    }}
                                    aria-label="Testimoni berikutnya"
                                >
                                    <ChevronRight className="h-5 w-5" style={{ color: '#88161c' }} />
                                </button>
                            </div>
                        </LiquidGlassCard>
                    </div>
                </div>
            </section>
        </>
    );
}
