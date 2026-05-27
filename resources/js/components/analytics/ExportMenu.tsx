import { router } from '@inertiajs/react';
import { Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface ExportMenuProps {
    courseId: string;
    startDate?: string;
    endDate?: string;
    preset?: string;
    className?: string;
}

export default function ExportMenu({ courseId, startDate, endDate, preset, className = '' }: ExportMenuProps) {
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
        const params: Record<string, string> = {};
        if (startDate) params.start_date = startDate;
        if (endDate) params.end_date = endDate;
        if (preset) params.preset = preset;
        return params;
    }, [startDate, endDate, preset]);

    const handleExportCSV = useCallback(() => {
        setIsExporting(true);
        setExportFormat('csv');
        setIsOpen(false);

        const params = new URLSearchParams({ format: 'csv', ...buildParams() });
        window.location.href = `/lecturer/courses/${courseId}/analytics/export?${params.toString()}`;

        setTimeout(() => {
            setIsExporting(false);
            setExportFormat(null);
        }, 2000);
    }, [courseId, buildParams]);

    const handleExportPDF = useCallback(() => {
        setIsExporting(true);
        setExportFormat('pdf');
        setIsOpen(false);

        const params = new URLSearchParams({ format: 'pdf', ...buildParams() });
        router.get(
            `/lecturer/courses/${courseId}/analytics/export?${params.toString()}`,
            {},
            {
                onFinish: () => {
                    setIsExporting(false);
                    setExportFormat(null);
                },
                onError: () => {
                    setIsExporting(false);
                    setExportFormat(null);
                },
            },
        );
    }, [courseId, buildParams]);

    const chipStyle = {
        background: 'rgba(136,22,28,0.06)',
        border: '1px solid rgba(136,22,28,0.12)',
        color: '#4A4A4A',
    };

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                disabled={isExporting}
                className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all disabled:opacity-50"
                style={{
                    ...chipStyle,
                }}
            >
                {isExporting ? (
                    <Loader2 className="h-4 w-4 animate-spin" style={{ color: '#88161c' }} />
                ) : (
                    <Download className="h-4 w-4" style={{ color: '#88161c' }} />
                )}
                <span>
                    {isExporting
                        ? `Exporting ${exportFormat?.toUpperCase()}...`
                        : 'Export'}
                </span>
            </button>

            {isOpen && !isExporting && (
                <div
                    className="absolute right-0 top-full z-50 mt-2 w-56 rounded-2xl p-2 shadow-lg"
                    style={{
                        background: 'rgba(255,255,255,0.95)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255,255,255,0.7)',
                    }}
                >
                    <button
                        type="button"
                        onClick={handleExportCSV}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-all hover:bg-gray-50"
                    >
                        <FileSpreadsheet className="h-4 w-4" style={{ color: '#16a34a' }} />
                        <div>
                            <p className="font-medium" style={{ color: '#4A4A4A' }}>
                                Export CSV
                            </p>
                            <p className="text-xs text-brand-muted-dark">Data tabular, bisa dibuka di Excel</p>
                        </div>
                    </button>
                    <button
                        type="button"
                        onClick={handleExportPDF}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-all hover:bg-gray-50"
                    >
                        <FileText className="h-4 w-4" style={{ color: '#dc2626' }} />
                        <div>
                            <p className="font-medium" style={{ color: '#4A4A4A' }}>
                                Export PDF
                            </p>
                            <p className="text-xs text-brand-muted-dark">Laporan terformat dengan charts</p>
                        </div>
                    </button>
                </div>
            )}
        </div>
    );
}
