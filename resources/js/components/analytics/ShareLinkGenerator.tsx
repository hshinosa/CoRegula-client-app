import { useCallback, useRef, useState } from 'react';
import { Check, Copy, Link, Loader2 } from 'lucide-react';

interface ShareLinkGeneratorProps {
    courseId: string;
    section: string;
    studentId?: string;
    metric?: string;
    startDate?: string;
    endDate?: string;
    className?: string;
}

export default function ShareLinkGenerator({
    courseId,
    section,
    studentId,
    metric,
    startDate,
    endDate,
    className = '',
}: ShareLinkGeneratorProps) {
    const [shareUrl, setShareUrl] = useState<string | null>(null);
    const [expiresAt, setExpiresAt] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const generateLink = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`/lecturer/courses/${courseId}/analytics/share`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '',
                },
                body: JSON.stringify({
                    section,
                    student_id: studentId,
                    metric,
                    start_date: startDate,
                    end_date: endDate,
                    expires_in_days: 7,
                }),
            });

            const json = await res.json();
            if (json.data?.url) {
                setShareUrl(json.data.url);
                setExpiresAt(json.data.expires_at ?? null);
            } else {
                setError(json.error ?? 'Gagal membuat link');
            }
        } catch {
            setError('Gagal membuat link');
        } finally {
            setLoading(false);
        }
    }, [courseId, section, studentId, metric, startDate, endDate]);

    const handleCopy = useCallback(async () => {
        if (!shareUrl) return;
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            inputRef.current?.select();
        }
    }, [shareUrl]);

    const formatExpiry = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
            });
        } catch {
            return dateStr;
        }
    };

    const chipStyle = {
        background: 'rgba(71,85,105,0.08)',
        color: '#334155',
        border: '1px solid rgba(71,85,105,0.15)',
    };

    return (
        <div className={className}>
            {!shareUrl ? (
                <button
                    type="button"
                    onClick={generateLink}
                    disabled={loading}
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all hover:opacity-80 disabled:opacity-50"
                    style={chipStyle}
                >
                    {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Link className="h-3.5 w-3.5" />}
                    {loading ? 'Membuat...' : 'Share Link'}
                </button>
            ) : (
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <input
                            ref={inputRef}
                            type="text"
                            value={shareUrl}
                            readOnly
                            className="flex-1 rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs text-[#4A4A4A]"
                        />
                        <button
                            type="button"
                            onClick={handleCopy}
                            className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                            style={{
                                background: copied ? 'rgba(34,197,94,0.10)' : 'rgba(136,22,28,0.08)',
                                color: copied ? '#166534' : '#88161c',
                            }}
                        >
                            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                            {copied ? 'Tersalin' : 'Salin'}
                        </button>
                    </div>
                    {expiresAt && (
                        <p className="text-[10px] text-[#9CA3AF]">
                            Link berlaku hingga {formatExpiry(expiresAt)}
                        </p>
                    )}
                </div>
            )}
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
}
