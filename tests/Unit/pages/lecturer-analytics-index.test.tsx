import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

const socketHandlers = new Map<string, (...args: unknown[]) => void>();

vi.mock('@inertiajs/react', async () => {
    const React = await import('react');

    return {
        Head: ({ title }: { title?: string }) => <>{title ? <title>{title}</title> : null}</>,
        Link: ({ children, href, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => <a href={href} {...props}>{children}</a>,
        router: {
            get: vi.fn(),
        },
    };
});

vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
        section: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => <section {...props}>{children}</section>,
    },
}));

vi.mock('socket.io-client', () => ({
    io: () => ({
        on: (event: string, handler: (...args: unknown[]) => void) => {
            socketHandlers.set(event, handler);
        },
        disconnect: vi.fn(),
    }),
}));

vi.mock('@/components/navigation/lecturer-nav', () => ({
    useLecturerNav: () => [],
}));

vi.mock('@/components/Welcome/utils/helpers', () => ({
    LiquidGlassCard: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
    OrganicBlob: () => null,
    SecondaryButton: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => <button {...props}>{children}</button>,
}));

vi.mock('@/components/analytics', () => ({
    DateRangePicker: () => <div>DateRangePicker</div>,
    ExportMenu: () => <div>ExportMenu</div>,
    TrendChart: () => <div>TrendChart</div>,
}));

vi.mock('@/components/ui/skeletons', () => ({
    DashboardSkeleton: () => <div>Loading...</div>,
    SkeletonChart: () => <div>Chart loading...</div>,
}));

vi.mock('@/layouts/app-layout', () => ({
    default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/lib/getAuthToken', () => ({
    getAuthToken: () => Promise.resolve('jwt-token'),
}));

vi.mock('@/components/ui/toaster', () => ({
    toast: {
        error: vi.fn(),
    },
}));

vi.mock('@/components/CourseExportButton', () => ({
    default: () => <div>CourseExportButton</div>,
}));

vi.mock('@/routes/lecturer', () => ({
    default: {
        analytics: {
            index: {
                url: ({ course }: { course: string | number }) => `/lecturer/courses/${course}/analytics`,
            },
            group: {
                url: ({ course, group }: { course: string | number; group: string | number | undefined }) => {
                    if (group === undefined) {
                        throw new Error('group route param missing');
                    }

                    return `/lecturer/courses/${course}/analytics/groups/${group}`;
                },
            },
        },
    },
}));

import CourseAnalytics from '@/pages/lecturer/analytics/index';

describe('lecturer analytics index', () => {
    beforeEach(() => {
        socketHandlers.clear();
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ data: [] }),
        }));
    });

    it('renders detail links from group id/name payload shape', async () => {
        render(
            <CourseAnalytics
                course={{
                    id: 'course-1',
                    code: 'IF201',
                    name: 'Pemrograman Web',
                    owner_id: 'lecturer-1',
                    join_code: 'JOIN123',
                    created_at: '2026-07-08T00:00:00Z',
                }}
                analytics={{
                    summary: {
                        totalGroups: 1,
                        totalMessages: 12,
                        averageQualityScore: 88,
                        groupsNeedingAttention: 0,
                    },
                    groups: [
                        {
                            id: 'group-1',
                            name: 'Kelompok A',
                            memberCount: 4,
                            sessionDiscussionCount: 2,
                            messageCount: 12,
                            qualityScore: 88,
                            recommendation: 'Pertahankan kualitas diskusi.',
                            engagementDistribution: {
                                cognitive: 6,
                                behavioral: 4,
                                emotional: 2,
                            },
                            needsAttention: false,
                        },
                    ],
                }}
                filters={{}}
            />,
        );

        await waitFor(() => expect(screen.getAllByText('Kelompok A')).toHaveLength(2));
        expect(screen.getByRole('link', { name: /detail/i })).toHaveAttribute(
            'href',
            '/lecturer/courses/course-1/analytics/groups/group-1',
        );
    });
});
