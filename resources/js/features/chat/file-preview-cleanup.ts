export interface PendingFileLike {
    preview?: string;
}

export function revokePendingFilePreviews(files: readonly PendingFileLike[]): void {
    for (const file of files) {
        if (file.preview) {
            URL.revokeObjectURL(file.preview);
        }
    }
}
