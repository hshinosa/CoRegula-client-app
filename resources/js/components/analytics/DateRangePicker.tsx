import { Calendar, ChevronDown } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export interface DateRange {
    startDate: string;
    endDate: string;
}

export interface DatePreset {
    label: string;
    value: string;
    getRange: () => DateRange;
}

const today = () => new Date().toISOString().split('T')[0];

const startOfWeek = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff)).toISOString().split('T')[0];
};

const startOfMonth = () => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
};

const startOfSemester = () => {
    const d = new Date();
    const month = d.getMonth();
    const year = d.getFullYear();
    if (month >= 1 && month <= 6) {
        return `${year}-02-01`;
    }
    return `${year}-08-01`;
};

const startOfAcademicYear = () => {
    const d = new Date();
    const month = d.getMonth();
    const year = d.getFullYear();
    if (month >= 7) {
        return `${year}-08-01`;
    }
    return `${year - 1}-08-01`;
};

export const DATE_PRESETS: DatePreset[] = [
    { label: 'Minggu Ini', value: 'this_week', getRange: () => ({ startDate: startOfWeek(), endDate: today() }) },
    { label: 'Bulan Ini', value: 'this_month', getRange: () => ({ startDate: startOfMonth(), endDate: today() }) },
    { label: 'Semester Ini', value: 'this_semester', getRange: () => ({ startDate: startOfSemester(), endDate: today() }) },
    { label: 'Tahun Ajaran', value: 'academic_year', getRange: () => ({ startDate: startOfAcademicYear(), endDate: today() }) },
];

interface DateRangePickerProps {
    value?: DateRange;
    preset?: string;
    onChange: (range: DateRange, preset?: string) => void;
    className?: string;
}

export default function DateRangePicker({ value, preset: activePreset, onChange, className = '' }: DateRangePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [customStart, setCustomStart] = useState(value?.startDate ?? '');
    const [customEnd, setCustomEnd] = useState(value?.endDate ?? '');
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (value) {
            setCustomStart(value.startDate);
            setCustomEnd(value.endDate);
        }
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handlePreset = useCallback((preset: DatePreset) => {
        const range = preset.getRange();
        setCustomStart(range.startDate);
        setCustomEnd(range.endDate);
        onChange(range, preset.value);
        setIsOpen(false);
    }, [onChange]);

    const handleCustomApply = useCallback(() => {
        if (customStart && customEnd) {
            onChange({ startDate: customStart, endDate: customEnd });
            setIsOpen(false);
        }
    }, [customStart, customEnd, onChange]);

    const displayLabel = useMemo(() => {
        if (activePreset) {
            const found = DATE_PRESETS.find((p) => p.value === activePreset);
            if (found) return found.label;
        }
        if (value?.startDate && value?.endDate) {
            return `${value.startDate} — ${value.endDate}`;
        }
        return 'Pilih Rentang Waktu';
    }, [activePreset, value]);

    const chipStyle = {
        background: 'rgba(136,22,28,0.06)',
        border: '1px solid rgba(136,22,28,0.12)',
        color: '#4A4A4A',
    };

    const activeChipStyle = {
        background: 'rgba(136,22,28,0.12)',
        border: '1px solid rgba(136,22,28,0.25)',
        color: '#88161c',
    };

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all"
                style={{
                    ...chipStyle,
                }}
            >
                <Calendar className="h-4 w-4" style={{ color: '#88161c' }} />
                <span>{displayLabel}</span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div
                    className="absolute left-0 top-full z-50 mt-2 w-80 rounded-2xl p-4 shadow-lg"
                    style={{
                        background: 'rgba(255,255,255,0.95)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255,255,255,0.7)',
                    }}
                >
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-brand-muted-dark">Presets</p>
                    <div className="mb-4 flex flex-wrap gap-2">
                        {DATE_PRESETS.map((p) => (
                            <button
                                key={p.value}
                                type="button"
                                onClick={() => handlePreset(p)}
                                className="rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
                                style={activePreset === p.value ? activeChipStyle : chipStyle}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>

                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand-muted-dark">Custom Range</p>
                    <div className="flex gap-2">
                        <input
                            type="date"
                            value={customStart}
                            onChange={(e) => setCustomStart(e.target.value)}
                            className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                        />
                        <span className="self-center text-xs text-brand-muted-dark">—</span>
                        <input
                            type="date"
                            value={customEnd}
                            onChange={(e) => setCustomEnd(e.target.value)}
                            className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={handleCustomApply}
                        disabled={!customStart || !customEnd}
                        className="mt-3 w-full rounded-lg py-2 text-sm font-semibold text-white transition-all disabled:opacity-40"
                        style={{ background: '#88161c' }}
                    >
                        Terapkan
                    </button>
                </div>
            )}
        </div>
    );
}
