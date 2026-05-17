import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChatMessageList } from '@/components/chat/ChatMessageList';
import type { ChatMessage } from '@/components/chat/ChatMessageList';

const mockMessages: ChatMessage[] = [
    {
        id: 'msg-1',
        sender_id: 'user-1',
        sender_type: 'student',
        sender_name: 'Alice',
        content: 'Halo semua!',
        created_at: '2026-05-18T10:00:00Z',
        showAvatar: true,
        showName: true,
        showTime: true,
        isGrouped: false,
    },
    {
        id: 'msg-2',
        sender_id: 'user-2',
        sender_type: 'student',
        sender_name: 'Bob',
        content: 'Halo Alice!',
        created_at: '2026-05-18T10:01:00Z',
        showAvatar: true,
        showName: true,
        showTime: true,
        isGrouped: false,
    },
];

describe('ChatMessageList', () => {
    it('renders loading state', () => {
        render(<ChatMessageList messages={[]} isLoading={true} />);
        expect(screen.getByText('Memuat pesan...')).toBeTruthy();
    });

    it('renders empty state when no messages', () => {
        render(<ChatMessageList messages={[]} />);
        expect(screen.getByText('Belum ada pesan. Mulai diskusi!')).toBeTruthy();
    });

    it('renders custom empty text', () => {
        render(<ChatMessageList messages={[]} emptyText="Tidak ada pesan" />);
        expect(screen.getByText('Tidak ada pesan')).toBeTruthy();
    });

    it('renders messages', () => {
        render(<ChatMessageList messages={mockMessages} currentUserId="user-1" />);
        expect(screen.getByText('Halo semua!')).toBeTruthy();
        expect(screen.getByText('Halo Alice!')).toBeTruthy();
    });

    it('shows sender name for non-own messages', () => {
        render(<ChatMessageList messages={mockMessages} currentUserId="user-1" />);
        expect(screen.getByText('Bob')).toBeTruthy();
    });

    it('calls onReply when reply button clicked', () => {
        const onReply = vi.fn();
        render(<ChatMessageList messages={mockMessages} currentUserId="user-1" onReply={onReply} />);
        const replyButtons = screen.getAllByText('Balas');
        fireEvent.click(replyButtons[0]);
        expect(onReply).toHaveBeenCalledWith(mockMessages[0]);
    });

    it('renders AI message with AI avatar', () => {
        const aiMessage: ChatMessage = {
            id: 'ai-1',
            sender_id: 'ai',
            sender_type: 'ai',
            sender_name: 'AI Assistant',
            content: 'Ini adalah respons AI',
            created_at: '2026-05-18T10:02:00Z',
            showAvatar: true,
            showName: true,
            showTime: true,
            isGrouped: false,
        };
        render(<ChatMessageList messages={[aiMessage]} currentUserId="user-1" />);
        expect(screen.getByText('Ini adalah respons AI')).toBeTruthy();
        expect(screen.getByText('AI')).toBeTruthy();
    });
});
