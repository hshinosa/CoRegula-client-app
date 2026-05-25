import { useCallback, useRef, useState } from 'react';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set([
    'png',
    'jpg',
    'jpeg',
    'gif',
    'webp',
    'pdf',
    'doc',
    'docx',
    'txt',
    'xls',
    'xlsx',
    'ppt',
    'pptx',
    'js',
    'jsx',
    'ts',
    'tsx',
    'json',
    'html',
    'css',
    'md',
    'py',
    'java',
    'c',
    'cpp',
    'cs',
    'php',
    'rb',
    'go',
    'rs',
    'sql',
    'xml',
    'yml',
    'yaml',
    'sh',
]);

const ALLOWED_MIME_TYPES = new Set([
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
]);

type DragEventHandler = React.DragEventHandler<HTMLDivElement>;

export interface UseDragDropOptions {
    onValidationError?: (message: string) => void;
}

function getExtension(fileName: string): string {
    const parts = fileName.split('.');
    return parts.length > 1 ? parts.at(-1)?.toLowerCase() ?? '' : '';
}

function isAllowedFile(file: File): boolean {
    const extension = getExtension(file.name);
    return ALLOWED_MIME_TYPES.has(file.type) || ALLOWED_EXTENSIONS.has(extension);
}

function toUploadSafeMimeType(file: File): string {
    if (ALLOWED_MIME_TYPES.has(file.type)) {
        return file.type;
    }

    const extension = getExtension(file.name);

    const fallbackMimeTypes: Record<string, string> = {
        js: 'text/plain',
        jsx: 'text/plain',
        ts: 'text/plain',
        tsx: 'text/plain',
        json: 'text/plain',
        html: 'text/plain',
        css: 'text/plain',
        md: 'text/plain',
        py: 'text/plain',
        java: 'text/plain',
        c: 'text/plain',
        cpp: 'text/plain',
        cs: 'text/plain',
        php: 'text/plain',
        rb: 'text/plain',
        go: 'text/plain',
        rs: 'text/plain',
        sql: 'text/plain',
        xml: 'text/plain',
        yml: 'text/plain',
        yaml: 'text/plain',
        sh: 'text/plain',
    };

    return fallbackMimeTypes[extension] ?? file.type;
}

function validateFile(file: File): string | null {
    if (file.size === 0) {
        return `${file.name}: file kosong`;
    }
    if (file.size > MAX_FILE_SIZE) {
        return `${file.name}: ukuran file melebihi 10MB`;
    }
    if (!isAllowedFile(file)) {
        return `${file.name}: tipe file tidak didukung`;
    }

    return null;
}

export function normalizeDroppedFile(file: File): File {
    if (!file.name) {
        return file;
    }

    const normalizedType = toUploadSafeMimeType(file);
    if (!normalizedType || normalizedType === file.type) {
        return file;
    }

    return new File([file.slice(0, file.size, 'application/octet-stream')], file.name, {
        type: normalizedType,
        lastModified: file.lastModified,
    });
}

export function useDragDrop(options: UseDragDropOptions = {}) {
    const { onValidationError } = options;
    const [isDragging, setIsDragging] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const dragDepthRef = useRef(0);

    const handleDragEnter = useCallback<DragEventHandler>((event) => {
        if (!event.dataTransfer.types.includes('Files')) return;

        event.preventDefault();
        event.stopPropagation();
        dragDepthRef.current += 1;
        setIsDragging(true);
    }, []);

    const handleDragOver = useCallback<DragEventHandler>((event) => {
        if (!event.dataTransfer.types.includes('Files')) return;

        event.preventDefault();
        event.stopPropagation();
        event.dataTransfer.dropEffect = 'copy';
    }, []);

    const handleDragLeave = useCallback<DragEventHandler>((event) => {
        event.preventDefault();
        event.stopPropagation();

        dragDepthRef.current = Math.max(dragDepthRef.current - 1, 0);
        if (dragDepthRef.current === 0) {
            setIsDragging(false);
        }
    }, []);

        const handleDrop = useCallback<DragEventHandler>((event) => {
        event.preventDefault();
        event.stopPropagation();
        dragDepthRef.current = 0;
        setIsDragging(false);

        const droppedFiles = Array.from(event.dataTransfer.files ?? []);
        if (droppedFiles.length === 0) {
            setFiles([]);
            return;
        }

        const acceptedFiles: File[] = [];
        const errors: string[] = [];

        for (const rawFile of droppedFiles) {
            const file = normalizeDroppedFile(rawFile);
            const error = validateFile(file);

            if (error) {
                errors.push(error);
                continue;
            }

            acceptedFiles.push(file);
        }

        setFiles(acceptedFiles);

        if (errors.length > 0) {
            onValidationError?.(errors.join('\n'));
        }
    }, [onValidationError]);

    const clearFiles = useCallback(() => {
        setFiles([]);
    }, []);

    return {
        files,
        isDragging,
        clearFiles,
        dragProps: {
            onDragEnter: handleDragEnter,
            onDragLeave: handleDragLeave,
            onDragOver: handleDragOver,
            onDrop: handleDrop,
        },
    };
}
