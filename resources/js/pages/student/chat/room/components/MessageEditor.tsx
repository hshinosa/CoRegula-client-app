import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Send, X } from 'lucide-react';

interface MessageEditorProps {
    initialContent: string;
    onSave: (newContent: string) => void;
    onCancel: () => void;
    isSaving: boolean;
}

export function MessageEditor({
    initialContent,
    onSave,
    onCancel,
    isSaving,
}: MessageEditorProps) {
    const [content, setContent] = useState(initialContent);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.setSelectionRange(
                textareaRef.current.value.length,
                textareaRef.current.value.length
            );
        }
    }, []);

    const adjustHeight = useCallback(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
        }
    }, []);

    useEffect(() => {
        adjustHeight();
    }, [content, adjustHeight]);

    const handleSubmit = () => {
        const trimmed = content.trim();
        if (trimmed && trimmed !== initialContent && !isSaving) {
            onSave(trimmed);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
        if (e.key === 'Escape') {
            onCancel();
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-1"
        >
            <div className="rounded-xl border border-blue-300 bg-blue-50/50 p-2 dark:border-blue-700 dark:bg-blue-900/20">
                <div className="flex items-center gap-1 px-1 pb-1">
                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                        Mengedit pesan
                    </span>
                </div>
                <div className="flex items-end gap-2">
                    <textarea
                        ref={textareaRef}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isSaving}
                        rows={1}
                        className="flex-1 resize-none rounded-lg border-0 bg-white/80 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-400 dark:bg-gray-800/80 dark:text-gray-100"
                        placeholder="Edit pesan..."
                    />
                    <div className="flex gap-1">
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={isSaving}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700"
                            aria-label="Batal edit"
                        >
                            <X className="h-4 w-4" />
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={!content.trim() || content.trim() === initialContent || isSaving}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500 text-white transition-colors hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Simpan edit"
                        >
                            <Send className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}