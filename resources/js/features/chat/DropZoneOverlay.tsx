import { AnimatePresence, motion } from 'framer-motion';

interface DropZoneOverlayProps {
    isDragging: boolean;
}

export function DropZoneOverlay({ isDragging }: DropZoneOverlayProps) {
    return (
        <AnimatePresence>
            {isDragging && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    className="pointer-events-none absolute inset-3 z-20 flex items-center justify-center rounded-[1.75rem] border-2 border-dashed border-[#88161c]/45 bg-white/75 p-6 backdrop-blur-sm"
                >
                    <div className="rounded-3xl border border-white/70 bg-white/80 px-6 py-5 text-center shadow-[0_24px_60px_rgba(136,22,28,0.12)]">
                        <p className="text-base font-semibold text-[#88161c] sm:text-lg">Drop file di sini</p>
                        <p className="mt-2 text-sm text-[#6B7280]">Gambar, PDF, dokumen, atau kode hingga 10MB</p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
