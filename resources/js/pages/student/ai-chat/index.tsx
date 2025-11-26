import { Head, Link, router, useForm } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { FormEvent, useEffect, useRef, useState } from 'react';

import { AiMessage, SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import student from '@/routes/student';
import auth from '@/routes/auth';

interface AiChat {
    id: string;
    title: string;
    created_at: string;
    updated_at: string;
    messages?: AiMessage[];
}

interface Props {
    chats: AiChat[];
    activeChat: AiChat | null;
}

export default function AiChatIndex({ chats, activeChat }: Props) {
    const { auth: authData } = usePage<SharedData>().props;
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isTyping, setIsTyping] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const safeChats = chats ?? [];
    const messages = activeChat?.messages ?? [];

    const messageForm = useForm({
        content: '',
    });

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Focus input on load
    useEffect(() => {
        inputRef.current?.focus();
    }, [activeChat]);

    const handleSendMessage = (e: FormEvent) => {
        e.preventDefault();
        if (!messageForm.data.content.trim() || messageForm.processing) return;

        if (!activeChat) {
            // Create new conversation with first message
            router.post(
                student.aiChat.store.url(),
                { 
                    title: messageForm.data.content.substring(0, 50),
                    first_message: messageForm.data.content 
                },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        messageForm.reset();
                    },
                }
            );
        } else {
            // Add message to existing conversation
            router.post(
                student.aiChat.messages.store.url({ chat: activeChat.id }),
                { content: messageForm.data.content },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        messageForm.reset();
                    },
                }
            );
        }
    };

    const handleNewChat = () => {
        router.visit(student.aiChat.index.url());
    };

    const handleDeleteChat = (id: string) => {
        router.delete(student.aiChat.destroy.url({ chat: id }), {
            onSuccess: () => {
                setShowDeleteModal(null);
            },
        });
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(e);
        }
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Hari Ini';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Kemarin';
        } else {
            return date.toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
            });
        }
    };

    return (
        <div className="flex h-screen bg-gradient-to-br from-zinc-50 via-white to-primary-50/30 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
            <Head title="Chat dengan AI" />

            {/* Sidebar - Conversation History */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.aside
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 320, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ type: 'tween', duration: 0.2 }}
                        className="flex h-full flex-col border-r border-primary-100 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80"
                    >
                        {/* Sidebar Header */}
                        <div className="flex h-16 items-center justify-between border-b border-primary-100 px-4 dark:border-zinc-800">
                            <Link
                                href={student.courses.index.url()}
                                className="flex items-center gap-2 text-zinc-600 hover:text-primary-600 dark:text-zinc-400 dark:hover:text-primary-400"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                <span className="text-sm font-medium">Kembali</span>
                            </Link>
                            <button
                                onClick={handleNewChat}
                                className="rounded-lg bg-primary-600 p-2 text-white hover:bg-primary-700"
                                title="Chat Baru"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </button>
                        </div>

                        {/* Conversation List */}
                        <div className="flex-1 overflow-y-auto p-3">
                            {safeChats.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <div className="mb-3 rounded-full bg-zinc-100 p-3 dark:bg-zinc-800">
                                        <svg className="h-6 w-6 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                    </div>
                                    <p className="text-sm text-zinc-500">Belum ada percakapan</p>
                                    <p className="mt-1 text-xs text-zinc-400">Mulai chat baru untuk bertanya kepada AI</p>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {safeChats.map((chat) => (
                                        <div
                                            key={chat.id}
                                            className={`group relative flex items-center rounded-lg p-3 transition-colors ${
                                                activeChat?.id === chat.id
                                                    ? 'bg-primary-100 dark:bg-primary-900/30'
                                                    : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
                                            }`}
                                        >
                                            <Link
                                                href={student.aiChat.show.url({ chat: chat.id })}
                                                className="flex flex-1 items-center gap-3"
                                            >
                                                <div className="flex-shrink-0">
                                                    <svg className="h-5 w-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                                    </svg>
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                                        {chat.title || 'Chat Baru'}
                                                    </p>
                                                    <p className="text-xs text-zinc-500">
                                                        {formatDate(chat.updated_at)}
                                                    </p>
                                                </div>
                                            </Link>
                                            <button
                                                onClick={() => setShowDeleteModal(chat.id)}
                                                className="absolute right-2 hidden rounded p-1 text-zinc-400 hover:bg-zinc-200 hover:text-error-600 group-hover:block dark:hover:bg-zinc-700 dark:hover:text-error-400"
                                            >
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* User Info */}
                        <div className="border-t border-primary-100 p-3 dark:border-zinc-800">
                            <div className="flex items-center gap-3 rounded-lg bg-primary-50/50 p-3 dark:bg-zinc-800/50">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary-200 bg-gradient-to-br from-primary-600 to-primary-800 font-heading text-sm font-bold text-white">
                                    {authData.user?.name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-semibold text-primary-900 dark:text-zinc-100">
                                        {authData.user?.name || 'User'}
                                    </p>
                                    <p className="truncate text-xs text-primary-600 dark:text-primary-400">Mahasiswa</p>
                                </div>
                                <Link
                                    href={auth.logout.url()}
                                    method="post"
                                    as="button"
                                    className="rounded-lg p-2 text-zinc-400 hover:bg-white hover:text-warning-600 dark:hover:bg-zinc-700"
                                    title="Keluar"
                                >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Main Chat Area */}
            <div className="flex flex-1 flex-col">
                {/* Chat Header */}
                <header className="flex h-16 items-center justify-between border-b border-primary-100 bg-white/80 px-4 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="rounded-lg p-2 text-zinc-600 hover:bg-primary-50 hover:text-primary-700 dark:hover:bg-zinc-800"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600">
                                <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="font-heading text-sm font-bold text-zinc-900 dark:text-zinc-100">
                                    AI Assistant
                                </h1>
                                <p className="text-xs text-zinc-500">Siap membantu pembelajaran Anda</p>
                            </div>
                        </div>
                    </div>
                    {activeChat && (
                        <span className="text-xs text-zinc-500">{activeChat.title}</span>
                    )}
                </header>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 lg:p-6">
                    {messages.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center text-center">
                            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
                                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                                Halo! Saya AI Assistant
                            </h2>
                            <p className="mt-2 max-w-md text-zinc-600 dark:text-zinc-400">
                                Saya siap membantu Anda dengan pertanyaan seputar mata kuliah, tugas, atau konsep pembelajaran lainnya.
                            </p>
                            <div className="mt-6 grid max-w-2xl gap-3 sm:grid-cols-2">
                                {[
                                    { icon: '📚', text: 'Jelaskan konsep pembelajaran kooperatif' },
                                    { icon: '💡', text: 'Bantu saya memahami materi ini' },
                                    { icon: '📝', text: 'Berikan contoh untuk tugas saya' },
                                    { icon: '🎯', text: 'Tips untuk belajar efektif' },
                                ].map((suggestion, index) => (
                                    <button
                                        key={index}
                                        onClick={() => messageForm.setData('content', suggestion.text)}
                                        className="flex items-center gap-3 rounded-lg border border-zinc-200 p-3 text-left text-sm transition-colors hover:border-primary-300 hover:bg-primary-50 dark:border-zinc-700 dark:hover:border-primary-700 dark:hover:bg-primary-900/10"
                                    >
                                        <span className="text-lg">{suggestion.icon}</span>
                                        <span className="text-zinc-700 dark:text-zinc-300">{suggestion.text}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="mx-auto max-w-3xl space-y-4">
                            {messages.map((message) => (
                                <motion.div
                                    key={message.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                                >
                                    <div
                                        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                                            message.role === 'user'
                                                ? 'bg-primary-600'
                                                : 'bg-gradient-to-br from-violet-500 to-purple-600'
                                        }`}
                                    >
                                        {message.role === 'user' ? (
                                            <span className="text-sm font-bold text-white">
                                                {authData.user?.name?.charAt(0).toUpperCase() || 'U'}
                                            </span>
                                        ) : (
                                            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                            </svg>
                                        )}
                                    </div>
                                    <div
                                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                                            message.role === 'user'
                                                ? 'bg-primary-600 text-white'
                                                : 'bg-white shadow-sm ring-1 ring-zinc-100 dark:bg-zinc-800 dark:ring-zinc-700'
                                        }`}
                                    >
                                        <p className={`text-sm whitespace-pre-wrap ${message.role === 'assistant' ? 'text-zinc-900 dark:text-zinc-100' : ''}`}>
                                            {message.content}
                                        </p>
                                        <p
                                            className={`mt-1 text-xs ${
                                                message.role === 'user' ? 'text-primary-200' : 'text-zinc-400'
                                            }`}
                                        >
                                            {formatTime(message.created_at)}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                            {isTyping && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600">
                                        <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                        </svg>
                                    </div>
                                    <div className="rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-zinc-100 dark:bg-zinc-800 dark:ring-zinc-700">
                                        <div className="flex gap-1">
                                            <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-400" style={{ animationDelay: '0ms' }} />
                                            <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-400" style={{ animationDelay: '150ms' }} />
                                            <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-400" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                {/* Message Input */}
                <div className="border-t border-primary-100 bg-white/80 p-4 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
                    <form onSubmit={handleSendMessage} className="mx-auto max-w-3xl">
                        <div className="relative flex items-end gap-3 rounded-2xl bg-zinc-100 p-2 dark:bg-zinc-800">
                            <textarea
                                ref={inputRef}
                                value={messageForm.data.content}
                                onChange={(e) => messageForm.setData('content', e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ketik pesan Anda..."
                                rows={1}
                                className="max-h-32 min-h-[40px] flex-1 resize-none bg-transparent px-3 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:outline-none dark:text-zinc-100"
                                style={{ height: 'auto' }}
                                onInput={(e) => {
                                    const target = e.target as HTMLTextAreaElement;
                                    target.style.height = 'auto';
                                    target.style.height = Math.min(target.scrollHeight, 128) + 'px';
                                }}
                            />
                            <button
                                type="submit"
                                disabled={!messageForm.data.content.trim() || messageForm.processing}
                                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary-600 text-white transition-colors hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {messageForm.processing ? (
                                    <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                ) : (
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        <p className="mt-2 text-center text-xs text-zinc-400">
                            Tekan Enter untuk mengirim, Shift+Enter untuk baris baru
                        </p>
                    </form>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {showDeleteModal && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowDeleteModal(null)}
                            className="fixed inset-0 z-40 bg-black"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        >
                            <div className="card w-full max-w-sm p-6 text-center" onClick={(e) => e.stopPropagation()}>
                                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-error-100 dark:bg-error-900/30">
                                    <svg className="h-6 w-6 text-error-600 dark:text-error-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                                    Hapus Percakapan?
                                </h3>
                                <p className="mt-2 text-sm text-zinc-500">
                                    Percakapan ini akan dihapus secara permanen dan tidak dapat dikembalikan.
                                </p>
                                <div className="mt-6 flex gap-3">
                                    <button
                                        onClick={() => setShowDeleteModal(null)}
                                        className="btn-secondary flex-1"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={() => handleDeleteChat(showDeleteModal)}
                                        className="flex-1 rounded-lg bg-error-600 px-4 py-2 text-sm font-medium text-white hover:bg-error-700"
                                    >
                                        Hapus
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
