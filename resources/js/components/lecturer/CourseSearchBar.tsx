import { Search, X } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface CourseSearchBarProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export function CourseSearchBar({ value, onChange, placeholder = 'Cari nama atau kode kelas...' }: CourseSearchBarProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                inputRef.current?.focus();
            }
            if (e.key === 'Escape' && document.activeElement === inputRef.current) {
                onChange('');
                inputRef.current?.blur();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onChange]);

    return (
        <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
            <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full rounded-xl border border-[rgba(136,22,28,0.12)] bg-white py-2.5 pl-10 pr-20 text-sm text-[#4A4A4A] placeholder:text-[#6B7280]/60 focus:border-[#88161c]/30 focus:outline-none focus:ring-2 focus:ring-[#88161c]/10 transition-all"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            />
            <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1.5">
                {value && (
                    <button
                        onClick={() => onChange('')}
                        className="flex h-5 w-5 items-center justify-center rounded-full text-[#6B7280] hover:bg-[rgba(136,22,28,0.08)] hover:text-[#88161c] transition-colors"
                    >
                        <X className="h-3 w-3" />
                    </button>
                )}
                <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-0.5 rounded border border-[rgba(136,22,28,0.15)] bg-[rgba(136,22,28,0.04)] px-1.5 font-mono text-[10px] font-medium text-[#6B7280]">
                    ⌘K
                </kbd>
            </div>
        </div>
    );
}
