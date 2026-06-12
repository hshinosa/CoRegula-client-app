import type { CitedMaterialRow } from '@/components/course/ChatWeekMaterialsPanel';
import type { ChatCitation, ChatDisplayMessage } from '@/types/chat';

export type MaterialIndexEntry = {
    id: string;
    title: string;
    file_name: string;
    file_type?: string | null;
};

/** Aggregate unique cited materials from AI messages (chronological). */
export function aggregateCitedMaterials(
    messages: ChatDisplayMessage[],
    materialIndex: Map<string, MaterialIndexEntry>,
): CitedMaterialRow[] {
    const seen = new Set<string>();
    const rows: CitedMaterialRow[] = [];

    for (const msg of messages) {
        if (msg.sender_type !== 'ai' || !msg.citations?.length) {
            continue;
        }
        for (const cite of msg.citations) {
            const id = cite.course_material_id;
            if (seen.has(id)) {
                continue;
            }
            const meta = materialIndex.get(id);
            if (!meta) {
                continue;
            }
            seen.add(id);
            rows.push({
                material: {
                    id: meta.id,
                    title: meta.title,
                    file_name: meta.file_name,
                    file_type: meta.file_type,
                },
                label: cite.label ?? meta.title,
            });
        }
    }

    return rows;
}

export function buildMaterialIndexFromApi(payload: {
    primary: Array<{ material: MaterialIndexEntry }>;
    earlier: Array<{ material: MaterialIndexEntry }>;
}): Map<string, MaterialIndexEntry> {
    const map = new Map<string, MaterialIndexEntry>();
    for (const row of [...payload.primary, ...payload.earlier]) {
        map.set(row.material.id, row.material);
    }
    return map;
}

export function citationChipLabel(cite: ChatCitation, materialIndex: Map<string, MaterialIndexEntry>): string {
    if (cite.label) {
        return cite.page != null ? `${cite.label} (h. ${cite.page})` : cite.label;
    }
    const meta = materialIndex.get(cite.course_material_id);
    const base = meta?.title ?? 'Materi';
    return cite.page != null ? `${base} (h. ${cite.page})` : base;
}