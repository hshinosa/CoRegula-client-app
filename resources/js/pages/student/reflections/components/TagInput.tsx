import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus } from 'lucide-react';

interface TagInputProps {
    tags: string[];
    onChange: (tags: string[]) => void;
    maxTags?: number;
    reflectionId?: string;
}

export function TagInput({ tags, onChange, maxTags = 10, reflectionId }: TagInputProps) {
    const [input, setInput] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const fetchSuggestions = useCallback(async (query: string) => {
        if (query.length < 1) {
            setSuggestions([]);
            return;
        }
        try {
            const response = await fetch(`/student/reflections/tags/suggestions?q=${encodeURIComponent(query)}`, {
                headers: { 'Accept': 'application/json' },
            });
            if (response.ok) {
                const data = await response.json();
                const filtered = (data.data ?? []).filter((s: string) => !tags.includes(s));
                setSuggestions(filtered);
                setShowSuggestions(filtered.length > 0);
            }
        } catch (_) {
        }
    }, [tags]);

    useEffect(() => {
        const timer = setTimeout(() => fetchSuggestions(input), 200);
        return () => clearTimeout(timer);
    }, [input, fetchSuggestions]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const addTag = (tag: string) => {
        const normalized = tag.toLowerCase().trim();
        if (!normalized || tags.includes(normalized) || tags.length >= maxTags) return;
        onChange([...tags, normalized]);
        setInput('');
        setShowSuggestions(false);
    };

    const removeTag = (tag: string) => {
        onChange(tags.filter((t) => t !== tag));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (input.trim()) addTag(input);
        } else if (e.key === 'Backspace' && !input && tags.length > 0) {
            removeTag(tags[tags.length - 1]);
        } else if (e.key === 'Escape') {
            setShowSuggestions(false);
        }
    };

    return (
        <div ref={containerRef} className="relative">
            <div
                className="flex flex-wrap items-center gap-1.5 rounded-lg bg-white/60 px-3 py-2 ring-1 ring-inset ring-white/50 focus-within:ring-2 focus-within:ring-[#88161c]/30"
                onClick={() => inputRef.current?.focus()}
                role="presentation"
            >
                <AnimatePresence mode="popLayout">
                    {tags.map((tag) => (
                        <motion.span
                            key={tag}
                            layout
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
                            style={{
                                background: 'rgba(136,22,28,0.1)',
                                color: '#88161c',
                                border: '1px solid rgba(136,22,28,0.15)',
                            }}
                        >
                            {tag}
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); removeTag(tag); }}
                                className="text-[#88161c]/60 hover:text-[#88161c]"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </motion.span>
                    ))}
                </AnimatePresence>

                {tags.length < maxTags && (
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                        placeholder={tags.length === 0 ? 'Tambah tag...' : ''}
                        className="min-w-[80px] flex-1 border-0 bg-transparent p-0 text-xs text-[#4A4A4A] placeholder:text-[#9ca3af] focus:outline-none focus:ring-0"
                        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    />
                )}
            </div>

            <span className="mt-1 block text-[10px] text-[#6B7280]">
                {tags.length}/{maxTags} tag
            </span>

            <AnimatePresence>
                {showSuggestions && suggestions.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="absolute left-0 right-0 top-full z-10 mt-1 max-h-40 overflow-auto rounded-lg bg-white shadow-lg ring-1 ring-black/5"
                    >
                        {suggestions.map((suggestion) => (
                            <button
                                key={suggestion}
                                type="button"
                                onClick={() => addTag(suggestion)}
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-[#4A4A4A] transition-colors hover:bg-[#88161c]/5"
                            >
                                <Plus className="h-3 w-3 text-[#6B7280]" />
                                {suggestion}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
