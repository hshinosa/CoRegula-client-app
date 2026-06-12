import { ChevronDown, FileText, Loader2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { LiquidGlassCard } from '@/components/Welcome/utils/helpers';
import type { DocumentViewerTarget } from '@/components/course/DocumentViewerModal';

export interface WeekMaterialRow {
    week_index: number;
    week_id: string;
    week_title: string;
    material: {
        id: string;
        title: string;
        description?: string | null;
        file_name: string;
        file_type?: string | null;
        file_size?: number;
    };
}

export interface CitedMaterialRow {
    material: WeekMaterialRow['material'];
    label?: string;
}

interface MaterialsApiResponse {
    session_week: { id: string; week_index: number; title: string } | null;
    primary: WeekMaterialRow[];
    earlier: WeekMaterialRow[];
    cited?: CitedMaterialRow[];
    message?: string;
}

interface ChatWeekMaterialsPanelProps {
    courseId: string;
    chatSpaceId: string;
    cited?: CitedMaterialRow[];
    onOpenDocument: (target: DocumentViewerTarget) => void;
    /** desktop sidebar uses card wrapper; mobile drawer uses plain blocks */
    variant?: 'card' | 'plain';
}

function fileBadge(fileName: string): string {
    const ext = fileName.split('.').pop()?.toUpperCase() ?? 'FILE';
    return ext.length <= 4 ? ext : 'DOC';
}

function MaterialRowButton({
    row,
    courseId,
    chatSpaceId,
    onOpen,
}: {
    row: WeekMaterialRow;
    courseId: string;
    chatSpaceId: string;
    onOpen: (t: DocumentViewerTarget) => void;
}) {
    const streamUrl = `/student/courses/${courseId}/materials/${row.material.id}/stream?chatSpace=${encodeURIComponent(chatSpaceId)}`;

    return (
        <button
            type="button"
            onClick={() =>
                onOpen({
                    title: row.material.title,
                    fileName: row.material.file_name,
                    streamUrl,
                    fileType: row.material.file_type,
                })
            }
            className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-white/40"
        >
            <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-brand-primary"
                style={{ background: 'rgba(136,22,28,0.08)', border: '1px solid rgba(136,22,28,0.12)' }}
            >
                {fileBadge(row.material.file_name)}
            </div>
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-brand-dark">{row.material.title}</p>
                <p className="truncate text-xs text-brand-muted-dark">{row.material.file_name}</p>
            </div>
        </button>
    );
}

function PanelBody({
    loading,
    error,
    data,
    courseId,
    chatSpaceId,
    cited,
    onOpenDocument,
}: {
    loading: boolean;
    error: string | null;
    data: MaterialsApiResponse | null;
    courseId: string;
    chatSpaceId: string;
    cited: CitedMaterialRow[];
    onOpenDocument: (t: DocumentViewerTarget) => void;
}) {
    const [earlierOpen, setEarlierOpen] = useState(false);

    const primaryIds = useMemo(
        () => new Set((data?.primary ?? []).map((r) => r.material.id)),
        [data?.primary],
    );
    const earlierIds = useMemo(
        () => new Set((data?.earlier ?? []).map((r) => r.material.id)),
        [data?.earlier],
    );

    const citedDeduped = useMemo(
        () => cited.filter((c) => !primaryIds.has(c.material.id) && !earlierIds.has(c.material.id)),
        [cited, primaryIds, earlierIds],
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center gap-2 py-6 text-sm text-brand-muted-dark">
                <Loader2 className="h-4 w-4 animate-spin" />
                Memuat materi…
            </div>
        );
    }

    if (error) {
        return <p className="text-sm text-red-600">{error}</p>;
    }

    if (data?.message && !data.session_week) {
        return <p className="text-sm text-amber-700">{data.message}</p>;
    }

    const weekHeading =
        data?.session_week != null
            ? `Minggu ${data.session_week.week_index}: ${data.session_week.title}`
            : 'Materi minggu ini';

    return (
        <div className="space-y-4">
            <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand-muted-dark">
                    {weekHeading}
                </h3>
                {(data?.primary?.length ?? 0) === 0 ? (
                    <p className="text-xs text-brand-muted-dark">Belum ada materi untuk minggu ini.</p>
                ) : (
                    <div className="space-y-1">
                        {data!.primary.map((row) => (
                            <MaterialRowButton
                                key={row.material.id}
                                row={row}
                                courseId={courseId}
                                chatSpaceId={chatSpaceId}
                                onOpen={onOpenDocument}
                            />
                        ))}
                    </div>
                )}
            </div>

            {(data?.earlier?.length ?? 0) > 0 && (
                <div>
                    <button
                        type="button"
                        onClick={() => setEarlierOpen((o) => !o)}
                        className="flex w-full items-center justify-between text-xs font-semibold uppercase tracking-wider text-brand-muted-dark"
                    >
                        Minggu sebelumnya ({data!.earlier.length})
                        <ChevronDown className={`h-4 w-4 transition-transform ${earlierOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {earlierOpen && (
                        <div className="mt-2 space-y-1">
                            {data!.earlier.map((row) => (
                                <MaterialRowButton
                                    key={`${row.week_id}-${row.material.id}`}
                                    row={row}
                                    courseId={courseId}
                                    chatSpaceId={chatSpaceId}
                                    onOpen={onOpenDocument}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div>
                <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand-muted-dark">
                    <FileText className="h-3.5 w-3.5" />
                    Dikutip dalam diskusi
                </h3>
                {citedDeduped.length === 0 ? (
                    <p className="text-xs text-brand-muted-dark">Belum ada sitasi dari asisten AI.</p>
                ) : (
                    <div className="space-y-1">
                        {citedDeduped.map((c) => {
                            const streamUrl = `/student/courses/${courseId}/materials/${c.material.id}/stream?chatSpace=${encodeURIComponent(chatSpaceId)}`;
                            return (
                                <button
                                    key={c.material.id}
                                    type="button"
                                    onClick={() =>
                                        onOpenDocument({
                                            title: c.label ?? c.material.title,
                                            fileName: c.material.file_name,
                                            streamUrl,
                                            fileType: c.material.file_type,
                                        })
                                    }
                                    className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-white/40"
                                >
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium text-brand-dark">
                                            {c.label ?? c.material.title}
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export function ChatWeekMaterialsPanel({
    courseId,
    chatSpaceId,
    cited = [],
    onOpenDocument,
    variant = 'card',
}: ChatWeekMaterialsPanelProps) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<MaterialsApiResponse | null>(null);

    const fetchMaterials = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(
                `/student/courses/${courseId}/chat-spaces/${chatSpaceId}/materials`,
                { headers: { Accept: 'application/json' }, credentials: 'same-origin' },
            );
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error((body as { message?: string }).message ?? 'Gagal memuat materi');
            }
            const json = (await res.json()) as MaterialsApiResponse;
            setData(json);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Gagal memuat materi');
        } finally {
            setLoading(false);
        }
    }, [courseId, chatSpaceId]);

    useEffect(() => {
        void fetchMaterials();
    }, [fetchMaterials]);

    const body = (
        <PanelBody
            loading={loading}
            error={error}
            data={data}
            courseId={courseId}
            chatSpaceId={chatSpaceId}
            cited={cited}
            onOpenDocument={onOpenDocument}
        />
    );

    if (variant === 'plain') {
        return <div className="mb-6">{body}</div>;
    }

    return (
        <LiquidGlassCard intensity="light" className="p-4" lightMode>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-brand-muted-dark">
                Materi diskusi
            </h3>
            {body}
        </LiquidGlassCard>
    );
}