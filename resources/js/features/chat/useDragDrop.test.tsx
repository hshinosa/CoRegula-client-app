import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useDragDrop } from './useDragDrop';

function createDragEvent(files: File[] = []) {
    return {
        dataTransfer: {
            files,
            types: files.length > 0 ? ['Files'] : [],
            dropEffect: 'none',
        },
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
    } as unknown as React.DragEvent<HTMLDivElement>;
}

describe('useDragDrop', () => {
    it('collects valid dropped files and resets dragging state', () => {
        const file = new File([new Uint8Array([1, 2, 3])], 'diagram.png', { type: 'image/png' });
        const { result } = renderHook(() => useDragDrop());

        act(() => {
            result.current.dragProps.onDragEnter(createDragEvent([file]));
        });

        expect(result.current.isDragging).toBe(true);

        act(() => {
            result.current.dragProps.onDrop(createDragEvent([file]));
        });

        expect(result.current.isDragging).toBe(false);
        expect(result.current.files).toEqual([file]);

        act(() => {
            result.current.clearFiles();
        });

        expect(result.current.files).toEqual([]);
    });

    it('rejects oversized files and reports the validation error', () => {
        const onValidationError = vi.fn();
        const file = new File([new Uint8Array(11 * 1024 * 1024)], 'big.pdf', { type: 'application/pdf' });
        const { result } = renderHook(() => useDragDrop({ onValidationError }));

        act(() => {
            result.current.dragProps.onDrop(createDragEvent([file]));
        });

        expect(result.current.files).toEqual([]);
        expect(onValidationError).toHaveBeenCalledTimes(1);
        expect(onValidationError.mock.calls[0]?.[0]).toContain('big.pdf');
        expect(onValidationError.mock.calls[0]?.[0]).toContain('10MB');
    });

    it('normalizes accepted code files into an upload-safe mime type', () => {
        const file = new File(['const value = 1;'], 'snippet.ts', { type: 'text/typescript' });
        const { result } = renderHook(() => useDragDrop());

        act(() => {
            result.current.dragProps.onDrop(createDragEvent([file]));
        });

        expect(result.current.files).toHaveLength(1);
        expect(result.current.files[0]?.name).toBe('snippet.ts');
        expect(result.current.files[0]?.type).toBe('text/plain');
    });
});
