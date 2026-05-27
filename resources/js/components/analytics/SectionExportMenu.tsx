import { useCallback, useEffect, useRef, useState } from 'react';
import { Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';

interface SectionExportMenuProps {
    courseId: string;
    section: string;
    startDate?: string;
    endDate?: string;
    preset?: string;
    studentId?: string;
    metric?: string;
    className?: string;
}

export default function SectionExportMenu({
    courseId,
    section,
    startDate,
    endDate,
    preset,
    studentId,
    metric,
    className = '',
}: SectionExportMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [exportFormat, setExportFormat] = useState<'csv' | 'pdf' | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const buildParams = useCallback(() => {
        const params: Record<string, string> = { section };
        if (startDate) params.start_date = startDate;
        if (endDate) params.end_date = endDate;
        if (preset) params.preset = preset;
        if (studentId) params.student_id = studentId;
        if (metric) params.metric = metric;
        return params;
    }, [section, startDate, endDate, preset, studentId, metric]);

    const handleExport = useCallback(
        (format: 'csv' | 'pdf') => {
            setIsExporting(true);
            setExportFormat(format);
            setIsOpen(false);

            const params = new URLSearchParams({ format, ...buildParams() });
            window.location.href = `/lecturer/courses/${courseId}/analytics/export-section?${params.toString()}`;

            setTimeout(() => {
                setIsExporting(false);
                setExportFormat(null);
            }, 2000);
        },
        [courseId, buildParams],
    );

    const chipStyle = {
        background: 'rgba(136,22,28,0.08)',
        color: '#88161c',
        border: '1px solid rgba(136,22,28,0.15)',
    };

    return (
        <div ref={containerRef} className={`relative inline-block ${className}`}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                disabled={isExporting}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all hover:opacity-80 disabled:opacity-50"
                style={chipStyle}
            >
                {isExporting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                    <Download className="h-3.5 w-3.5" />
                )}
                {isExporting ? `Export ${exportFormat?.toUpperCase()}...` : 'Export'}
            </button>

            {isOpen && (
                <div
                    className="absolute right-0 z-30 mt-1 w-48 overflow-hidden rounded-xl border shadow-lg"
                    style={{ background: 'rgba(255,255,255,0.97)', borderColor: 'rgba(0,0,0,0.08)', backdropFilter: 'blur(12px)' }}
                >
                    <button
                        type="button"
                        onClick={() => handleExport('csv')}
                        className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm text-brand-dark transition-colors hover:bg-[#F9FAFB]"
                    >
                        <FileSpreadsheet className="h-4 w-4 text-[#166534]" />
                        Export CSV
                    </button>
                    <button
                        type="button"
                        onClick={() => handleExport('pdf')}
                        className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm text-brand-dark transition-colors hover:bg-[#F9FAFB]"
                        style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}
                    >
                        <FileText className="h-4 w-4 text-brand-primary" />
                        Export PDF
                    </button>
                </div>
            )}
        </div>
    );
}
