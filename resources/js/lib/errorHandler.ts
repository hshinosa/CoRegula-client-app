import axios from 'axios';

interface DomainError {
    message: string;
    code?: string;
}

function isDomainError(error: unknown): error is DomainError {
    return (
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof (error as DomainError).message === 'string'
    );
}

export function getErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) return 'Sesi Anda telah berakhir. Silakan login kembali.';
        if (error.response?.status === 403) return 'Anda tidak memiliki akses untuk melakukan ini.';
        if (error.response?.status === 429) return 'Terlalu banyak permintaan. Tunggu sebentar.';
        if (error.response?.status === 500) return 'Server error. Tim kami sedang memperbaiki.';
        if (error.response?.status === 503) return 'Layanan tidak tersedia. Coba lagi nanti.';
        if (error.code === 'ECONNABORTED') return 'Koneksi timeout. Periksa internet Anda.';
        if (error.code === 'ERR_NETWORK') return 'Tidak ada koneksi internet.';
        return error.response?.data?.message || 'Terjadi kesalahan. Coba lagi.';
    }

    if (error instanceof Error) {
        return error.message || 'Terjadi kesalahan tidak terduga.';
    }

    if (isDomainError(error)) {
        return error.message;
    }

    if (error instanceof Event && error.type === 'error') {
        return 'Koneksi terputus. Periksa internet Anda.';
    }

    return 'Terjadi kesalahan tidak terduga.';
}
