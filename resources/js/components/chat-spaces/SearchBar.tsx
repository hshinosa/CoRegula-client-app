import { Search, X } from 'lucide-react';
import { useCallback, useRef, useEffect } from 'react';

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    onClear: () => void;
    placeholder?: string;
}

export function SearchBar({
    value,
    onChange,
    onClear,
    placeholder = 'Cari ruang diskusi...',
}: SearchBarProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClear();
                inputRef.current?.blur();
            }
        },
        [onClear]
    );

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                inputRef.current?.focus();
            }
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, []);

    return (
        <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <Search className="h-4 w-4 text-brand-muted-dark" />
            </div>
            <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="block w-full rounded-xl border-0 bg-white/60 py-3 pl-11 pr-10 text-sm text-brand-dark shadow-brand-sm ring-1 ring-inset ring-white/50 placeholder:text-[#9ca3af] focus:ring-2 focus:ring-inset focus:ring-brand-primary/30"
                aria-label="Cari ruang diskusi"
            />
            {value && (
                <button
                    type="button"
                    onClick={onClear}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-brand-muted-dark transition-colors hover:text-brand-dark"
                    aria-label="Hapus pencarian"
                >
                    <X className="h-4 w-4" />
                </button>
            )}
        </div>
    );
}
