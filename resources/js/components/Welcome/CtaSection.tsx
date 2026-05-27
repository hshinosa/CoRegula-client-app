import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { LiquidGlassCard, PrimaryButton, SecondaryButton, useReducedMotion } from './utils/helpers';

type Props = { lightMode: boolean };

const trustPoints = [
    'Setup kurang dari 5 menit',
    'Tidak perlu kartu kredit',
    'Gratis untuk mahasiswa',
];

export default function CtaSection({ lightMode }: Props) {
    const prefersReducedMotion = useReducedMotion();

    return (
        <>
            {/* ========== CTA SECTION ========== */}
            <section id="cta" className="relative py-32">
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
                    <motion.div
                        animate={
                            prefersReducedMotion
                                ? { scale: 1, opacity: 0.2 }
                                : {
                                      scale: [1, 1.08, 1],
                                      opacity: [0.2, 0.3, 0.2],
                                  }
                        }
                        transition={
                            prefersReducedMotion
                                ? { duration: 0.3 }
                                : { duration: 12, repeat: Infinity, ease: 'easeInOut' }
                        }
                        className="absolute h-[440px] w-[440px] rounded-full blur-[120px]"
                        style={{ background: lightMode ? 'rgba(136,22,28,0.08)' : 'rgba(164,18,25,0.12)' }}
                    />
                </div>

                <div className="mx-auto max-w-4xl px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="text-center"
                    >
                        <LiquidGlassCard className="p-12 md:p-16" intensity="medium" lightMode={lightMode}>
                            <h2
                                className="mb-6 text-4xl font-light tracking-tight md:text-5xl lg:text-6xl"
                            >
                                Siap mulai <span className="text-brand-muted-dark italic">kolaborasi</span> yang lebih bermakna?
                            </h2>
                            <p className="mx-auto mb-8 max-w-xl text-brand-muted-dark">
                                Dikembangkan sebagai bagian dari penelitian akademik di Telkom University,
                                Kolabri menghadirkan pendekatan berbasis riset untuk pembelajaran kolaboratif.
                            </p>

                            {/* Trust signals */}
                            <div className="mx-auto mb-10 flex flex-wrap items-center justify-center gap-4">
                                {trustPoints.map((point, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 10 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.4, delay: 0.3 + idx * 0.1 }}
                                        className="flex items-center gap-2 text-sm"
                                        style={{ color: '#6B7280' }}
                                    >
                                        <CheckCircle2 className="h-4 w-4" style={{ color: '#88161c' }} />
                                        <span>{point}</span>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Buttons */}
                            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                                <PrimaryButton href="/register">
                                    Daftar Gratis <ArrowRight className="h-4 w-4" />
                                </PrimaryButton>
                                <SecondaryButton href="/login" lightMode={lightMode}>
                                    Masuk
                                </SecondaryButton>
                            </div>
                        </LiquidGlassCard>
                    </motion.div>
                </div>
            </section>
        </>
    );
}
