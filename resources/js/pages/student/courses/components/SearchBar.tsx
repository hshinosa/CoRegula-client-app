import { Search, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = 'Cari mata kuliah...' }: SearchBarProps) {
    const [localValue, setLocalValue] = useState(value);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isInitialMount = useRef(true);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        setLocalValue(value);
    }, [value]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setLocalValue(newValue);

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            onChange(newValue);
        }, 300);
    }, [onChange]);

    const handleClear = useCallback(() => {
        setLocalValue('');
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }
        onChange('');
    }, [onChange]);

    useEffect(() => {
        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, []);

    return (
        <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <Search className="h-4.5 w-4.5 text-[#9CA3AF]" />
            </div>
            <input
                type="text"
                value={localValue}
                onChange={handleChange}
                placeholder={placeholder}
                className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-10 text-sm text-brand-dark shadow-brand-sm transition-all focus:border-brand-primary/30 focus:outline-none focus:ring-2 focus:ring-brand-primary/10"
            />
            {localValue && (
                <button
                    onClick={handleClear}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#9CA3AF] transition-colors hover:text-brand-dark"
                    type="button"
                >
                    <X className="h-4 w-4" />
                </button>
            )}
        </div>
    );
}
