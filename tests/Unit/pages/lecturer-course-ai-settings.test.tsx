import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

const inertiaState = vi.hoisted(() => ({
    formData: {
        min_members_per_group: 1,
        max_members_per_group: 8,
        ai_guardrail_preset: 'balanced' as 'strict' | 'balanced' | 'relaxed',
        ai_guardrail_allow_rewrite: true,
        ai_guardrail_allow_flag_only: false,
        ai_scaffolding_level: 'auto' as 'auto' | 'early' | 'late',
        ai_scaffolding_enabled: false,
    },
}));

vi.mock('@inertiajs/react', async () => {
    const React = await import('react');

    return {
        Head: ({ title }: { title?: string }) => <>{title ? <title>{title}</title> : null}</>,
        useForm: (initialData: typeof inertiaState.formData) => {
            const [data, setDataState] = React.useState({ ...initialData, ...inertiaState.formData });

            const setData = (key: keyof typeof data, value: (typeof data)[typeof key]) => {
                setDataState((prev) => ({ ...prev, [key]: value }));
            };

            return {
                data,
                setData,
                put: vi.fn(),
                processing: false,
                errors: {},
            };
        },
    };
});

vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
    },
}));

vi.mock('@/components/navigation/lecturer-nav', () => ({
    useLecturerNav: () => [],
}));

vi.mock('@/components/Welcome/utils/helpers', () => ({
    LiquidGlassCard: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
    OrganicBlob: () => null,
    PrimaryButton: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: string }) => <button {...props}>{children}</button>,
    SecondaryButton: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: string }) => <button {...props}>{children}</button>,
}));

vi.mock('@/components/ui/skeletons', () => ({
    DashboardSkeleton: () => <div>Loading...</div>,
}));

vi.mock('@/components/ui/input-error', () => ({
    InputError: ({ message }: { message?: string }) => (message ? <div>{message}</div> : null),
}));

vi.mock('@/components/lecturer/CourseDetailTabs', () => ({
    default: () => <div>Course tabs</div>,
}));

vi.mock('@/components/lecturer/AktivitasTab', () => ({
    default: () => <div>Aktivitas tab</div>,
}));

vi.mock('@/components/lecturer/AttendanceTab', () => ({
    default: () => <div>Attendance tab</div>,
}));

vi.mock('@/components/lecturer/UnifiedMaterialsTab', () => ({
    default: () => <div>Materials tab</div>,
}));

vi.mock('@/layouts/app-layout', () => ({
    default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/routes/lecturer', () => ({
    default: {
        groups: { index: { url: () => '/lecturer/groups?course=course-1' } },
        analytics: { detail: { url: () => '/lecturer/analytics/1' } },
    },
}));

import ShowCourse from '@/pages/lecturer/courses/show';

describe('lecturer course AI settings copy', () => {
    beforeEach(() => {
        inertiaState.formData = {
            min_members_per_group: 1,
            max_members_per_group: 8,
            ai_guardrail_preset: 'balanced',
            ai_guardrail_allow_rewrite: true,
            ai_guardrail_allow_flag_only: false,
            ai_scaffolding_level: 'auto',
            ai_scaffolding_enabled: false,
        };

        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, json: async () => ({}) }));
    });

    it('shows formal guardrail copy and hides scaffolding level when disabled', async () => {
        render(
            <ShowCourse
                course={{
                    id: 'course-1',
                    code: 'IF201',
                    name: 'Pemrograman Web',
                    owner_id: 'lecturer-1',
                    join_code: 'ABC123',
                    min_members_per_group: 1,
                    max_members_per_group: 8,
                    ai_guardrail_preset: 'balanced',
                    ai_guardrail_allow_rewrite: true,
                    ai_guardrail_allow_flag_only: false,
                    ai_scaffolding_level: 'auto',
                    ai_scaffolding_enabled: false,
                    created_at: '2026-07-08T00:00:00.000Z',
                    knowledge_base: [],
                }}
            />,
        );

        await waitFor(() => expect(screen.getByText('Simpan aturan grup')).toBeInTheDocument());

        expect(screen.getByText('Tingkat pembatasan AI')).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'Ketat' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'Seimbang' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'Fleksibel' })).toBeInTheDocument();

        expect(screen.getByText('Izinkan AI menyesuaikan jawaban ke bentuk yang aman')).toBeInTheDocument();
        expect(
            screen.getByText(/Apabila mahasiswa mengajukan permintaan yang tidak layak dijawab secara langsung/i),
        ).toBeInTheDocument();

        expect(screen.getByText('Untuk pelanggaran ringan, tampilkan peringatan tanpa memblokir respons')).toBeInTheDocument();
        expect(screen.getByText(/AI tetap dapat merespons, tetapi sistem akan menandai interaksi/i)).toBeInTheDocument();

        expect(screen.getByText('Izinkan AI menyesuaikan tingkat pendampingan sesuai kebutuhan belajar')).toBeInTheDocument();
        expect(screen.getByText('AI tidak menyesuaikan tingkat pendampingan secara khusus.')).toBeInTheDocument();
        expect(screen.queryByText('Tingkat pendampingan AI')).not.toBeInTheDocument();
    });

    it('shows scaffolding level selector after enabling adaptive scaffolding', async () => {
        render(
            <ShowCourse
                course={{
                    id: 'course-1',
                    code: 'IF201',
                    name: 'Pemrograman Web',
                    owner_id: 'lecturer-1',
                    join_code: 'ABC123',
                    min_members_per_group: 1,
                    max_members_per_group: 8,
                    ai_guardrail_preset: 'balanced',
                    ai_guardrail_allow_rewrite: true,
                    ai_guardrail_allow_flag_only: false,
                    ai_scaffolding_level: 'auto',
                    ai_scaffolding_enabled: false,
                    created_at: '2026-07-08T00:00:00.000Z',
                    knowledge_base: [],
                }}
            />,
        );

        await waitFor(() => expect(screen.getByText('Simpan aturan grup')).toBeInTheDocument());

        fireEvent.click(screen.getByRole('checkbox', { name: /Izinkan AI menyesuaikan tingkat pendampingan sesuai kebutuhan belajar/i }));

        expect(screen.getByText('Tingkat pendampingan AI')).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'Otomatis menyesuaikan' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'Pendampingan tinggi (lebih terarah dan bertahap)' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'Pendampingan ringan (lebih mandiri)' })).toBeInTheDocument();
        expect(screen.getByText(/Saat diaktifkan, AI dapat menyesuaikan seberapa rinci arahan/i)).toBeInTheDocument();
    });
});
