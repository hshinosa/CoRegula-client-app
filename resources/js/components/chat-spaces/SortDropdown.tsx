import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpDown, Check, Clock, Activity, SortAsc } from 'lucide-react';
import type { SpaceSort } from '@/hooks/useSpaceFilters';

interface SortOption {
    value: SpaceSort;
    label: string;
    icon: React.ReactNode;
}

const SORT_OPTIONS: SortOption[] = [
    { value: 'terbaru', label: 'Terbaru', icon: <Clock className="h-4 w-4" /> },
    { value: 'paling-aktif', label: 'Paling aktif', icon: <Activity className="h-4 w-4" /> },
    { value: 'alfabet', label: 'Alfabet A-Z', icon: <SortAsc className="h-4 w-4" /> },
];

interface SortDropdownProps {
    value: SpaceSort;
    onChange: (sort: SpaceSort) => void;
}

export function SortDropdown({ value, onChange }: SortDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const currentOption = SORT_OPTIONS.find((opt) => opt.value === value) || SORT_OPTIONS[0];

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, []);

    return (
        <div ref={dropdownRef} className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-brand-muted-dark transition-all duration-200 hover:bg-white/60 hover:text-brand-dark"
                style={{
                    background: 'rgba(255,255,255,0.4)',
                    border: '1px solid rgba(255,255,255,0.5)',
                    backdropFilter: 'blur(8px)',
                }}
                aria-expanded={isOpen}
                aria-haspopup="listbox"
                aria-label="Urutkan"
            >
                <ArrowUpDown className="h-4 w-4" />
                <span className="hidden sm:inline">{currentOption.label}</span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 z-30 mt-2 w-48 overflow-hidden rounded-xl shadow-lg"
                        style={{
                            background: 'rgba(255,255,255,0.95)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255,255,255,0.6)',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                        }}
                        role="listbox"
                        aria-label="Pilih urutan"
                    >
                        {SORT_OPTIONS.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => {
                                    onChange(option.value);
                                    setIsOpen(false);
                                }}
                                className="flex w-full items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-brand-primary/5"
                                style={{
                                    color: option.value === value ? '#88161c' : '#4A4A4A',
                                    fontWeight: option.value === value ? 600 : 400,
                                }}
                                role="option"
                                aria-selected={option.value === value}
                            >
                                <span style={{ color: option.value === value ? '#88161c' : '#6B7280' }}>
                                    {option.icon}
                                </span>
                                {option.label}
                                {option.value === value && (
                                    <Check className="ml-auto h-4 w-4" style={{ color: '#88161c' }} />
                                )}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
