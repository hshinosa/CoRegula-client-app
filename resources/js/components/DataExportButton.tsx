import { useState, useEffect, useRef } from 'react';
import { Download, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import axios from 'axios';
import { getAuthToken } from '@/lib/getAuthToken';

export default function DataExportButton({ className = '' }: { className?: string }) {
    const [isExporting, setIsExporting] = useState(false);
    const [status, setStatus] = useState<'idle' | 'pending' | 'processing' | 'completed' | 'failed'>('idle');
    const [error, setError] = useState<string | null>(null);
    const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const startExport = async () => {
        try {
            setIsExporting(true);
            setError(null);
            setStatus('pending');

            const token = await getAuthToken();
            const response = await axios.post(
                '/api/user/data-export',
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const newJobId = response.data.jobId;
            startPolling(newJobId);
        } catch (err: any) {
            setError(err.response?.data?.error?.message || 'Export gagal dimulai');
            setStatus('failed');
            setIsExporting(false);
        }
    };

    const startPolling = (jobId: string) => {
        pollIntervalRef.current = setInterval(() => {
            checkStatus(jobId);
        }, 3000);
    };

    const stopPolling = () => {
        if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
        }
    };

    const checkStatus = async (jobId: string) => {
        try {
            const token = await getAuthToken();
            const response = await axios.get(`/api/user/data-export/${jobId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const newStatus = response.data.status;
            setStatus(newStatus);

            if (newStatus === 'completed') {
                stopPolling();
                downloadFile(jobId);
                setTimeout(() => {
                    setStatus('idle');
                    setIsExporting(false);
                }, 2000);
            } else if (newStatus === 'failed' || newStatus === 'expired') {
                stopPolling();
                setError('Export gagal atau kadaluarsa');
                setIsExporting(false);
            }
        } catch (err: any) {
            stopPolling();
            setError(err.response?.data?.error?.message || 'Gagal memeriksa status');
            setStatus('failed');
            setIsExporting(false);
        }
    };

    const downloadFile = async (jobId: string) => {
        try {
            const token = await getAuthToken();
            const response = await axios.get(`/api/user/data-export/${jobId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const jsonData = JSON.stringify(response.data, null, 2);
            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `data-saya-${new Date().toISOString().split('T')[0]}.json`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err: any) {
            setError('Gagal mengunduh file');
        }
    };

    useEffect(() => {
        return () => {
            stopPolling();
        };
    }, []);

    const getStatusText = () => {
        switch (status) {
            case 'pending':
                return 'Mempersiapkan...';
            case 'processing':
                return 'Memproses...';
            case 'completed':
                return 'Selesai!';
            case 'failed':
                return 'Gagal';
            default:
                return 'Download Data Saya';
        }
    };

    const getStatusIcon = () => {
        if (status === 'completed') return <CheckCircle2 className="h-4 w-4" style={{ color: '#166534' }} />;
        if (status === 'failed') return <XCircle className="h-4 w-4" style={{ color: '#b91c1c' }} />;
        if (isExporting) return <Loader2 className="h-4 w-4 animate-spin" style={{ color: '#88161c' }} />;
        return <Download className="h-4 w-4" style={{ color: '#88161c' }} />;
    };

    return (
        <div className={className}>
            <button
                type="button"
                onClick={startExport}
                disabled={isExporting}
                className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-all disabled:opacity-50"
                style={{
                    background: 'rgba(136,22,28,0.06)',
                    border: '1px solid rgba(136,22,28,0.12)',
                    color: '#4A4A4A',
                }}
            >
                {getStatusIcon()}
                <span>{getStatusText()}</span>
            </button>
            {error && (
                <p className="mt-2 text-xs text-red-600 text-center">{error}</p>
            )}
        </div>
    );
}
