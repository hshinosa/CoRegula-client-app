import { useCallback, useRef, useState, type DragEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, ZoomIn, ZoomOut, RotateCcw, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { BaseModal } from '@/components/ui/BaseModal';
import { useAvatarUpload } from '../hooks/useAvatarUpload';
import { validateAvatarFile } from '../utils/avatar-helpers';

interface AvatarUrls {
    thumbnail: string | null;
    medium: string | null;
    large: string | null;
}

interface CropState {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface Props {
    onUploadComplete: (urls: AvatarUrls) => void;
    onCancel?: () => void;
}

export default function AvatarUpload({ onUploadComplete, onCancel }: Props) {
    const { upload, uploading, progress } = useAvatarUpload();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);
    const dropRef = useRef<HTMLDivElement>(null);

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [showCrop, setShowCrop] = useState(false);
    const [crop, setCrop] = useState<CropState | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
    const [zoom, setZoom] = useState(1);
    const [isDragOver, setIsDragOver] = useState(false);

    const handleFile = useCallback((file: File) => {
        const error = validateAvatarFile(file);
        if (error) {
            toast.error(error);
            return;
        }
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setShowCrop(true);
        setCrop(null);
        setZoom(1);
    }, []);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        handleFile(file);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }, [handleFile]);

    const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    }, [handleFile]);

    const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback(() => setIsDragOver(false), []);

    const handleImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
        const img = e.currentTarget;
        const rect = img.getBoundingClientRect();
        setImageSize({ width: rect.width, height: rect.height });
        const size = Math.min(rect.width, rect.height) * 0.8;
        setCrop({
            x: (rect.width - size) / 2,
            y: (rect.height - size) / 2,
            width: size,
            height: size,
        });
    }, []);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (!crop) return;
        setIsDragging(true);
        setDragStart({ x: e.clientX - crop.x, y: e.clientY - crop.y });
    }, [crop]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isDragging || !crop) return;
        const newX = Math.max(0, Math.min(e.clientX - dragStart.x, imageSize.width - crop.width));
        const newY = Math.max(0, Math.min(e.clientY - dragStart.y, imageSize.height - crop.height));
        setCrop({ ...crop, x: newX, y: newY });
    }, [isDragging, crop, dragStart, imageSize]);

    const handleMouseUp = useCallback(() => setIsDragging(false), []);

    const handleZoomIn = useCallback(() => setZoom((z) => Math.min(z + 0.2, 3)), []);
    const handleZoomOut = useCallback(() => setZoom((z) => Math.max(z - 0.2, 0.5)), []);
    const handleResetZoom = useCallback(() => setZoom(1), []);

    const handleCropConfirm = useCallback(async () => {
        if (!selectedFile || !crop || !imgRef.current) return;
        const img = imgRef.current;
        const scaleX = img.naturalWidth / img.clientWidth;
        const scaleY = img.naturalHeight / img.clientHeight;

        const realCrop = {
            x: crop.x * scaleX / zoom,
            y: crop.y * scaleY / zoom,
            width: (crop.width * scaleX) / zoom,
            height: (crop.height * scaleY) / zoom,
        };

        setShowCrop(false);
        const urls = await upload(selectedFile, realCrop);
        if (urls) {
            onUploadComplete(urls);
        }
        cleanup();
    }, [selectedFile, crop, zoom, upload, onUploadComplete]);

    const handleUploadWithoutCrop = useCallback(async () => {
        if (!selectedFile) return;
        setShowCrop(false);
        const urls = await upload(selectedFile);
        if (urls) {
            onUploadComplete(urls);
        }
        cleanup();
    }, [selectedFile, upload, onUploadComplete]);

    const cleanup = useCallback(() => {
        setSelectedFile(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
    }, [previewUrl]);

    const handleCloseCrop = useCallback(() => {
        setShowCrop(false);
        cleanup();
        onCancel?.();
    }, [cleanup, onCancel]);

    const handleClickUpload = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    return (
        <>
            <div
                ref={dropRef}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={handleClickUpload}
                className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 transition-all duration-200 ${
                    isDragOver
                        ? 'border-blue-400 bg-blue-50 dark:border-blue-500 dark:bg-blue-900/20'
                        : 'border-gray-300 bg-gray-50/50 hover:border-blue-300 hover:bg-blue-50/30 dark:border-gray-600 dark:bg-gray-800/30 dark:hover:border-blue-600'
                }`}
            >
                {uploading ? (
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            Mengunggah...
                        </p>
                        <div className="h-2 w-48 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                            <motion.div
                                className="h-full rounded-full bg-blue-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>
                        <p className="text-xs text-gray-600">{progress}%</p>
                    </div>
                ) : (
                    <>
                        <Upload className="mb-3 h-10 w-10 text-gray-600 transition-colors group-hover:text-blue-500" />
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            Klik atau seret file ke sini
                        </p>
                        <p className="mt-1 text-xs text-gray-600">
                            JPEG, PNG, WebP · Maks 2MB
                        </p>
                    </>
                )}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileSelect}
                    className="hidden"
                />
            </div>

            <BaseModal open={showCrop && Boolean(previewUrl)} title="Sesuaikan Foto" onClose={handleCloseCrop} size="xl" className="relative mx-4 max-w-2xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-800">
                        <div>
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Sesuaikan Foto
                                </h3>
                                <button
                                    onClick={handleCloseCrop}
                                    className="rounded-lg p-1 text-gray-600 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="mb-4 flex items-center justify-center gap-2">
                                <button
                                    onClick={handleZoomOut}
                                    className="rounded-lg bg-gray-100 p-2 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
                                    title="Zoom out"
                                >
                                    <ZoomOut className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                                </button>
                                <button
                                    onClick={handleResetZoom}
                                    className="rounded-lg bg-gray-100 p-2 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
                                    title="Atur ulang zoom"
                                >
                                    <RotateCcw className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                                </button>
                                <button
                                    onClick={handleZoomIn}
                                    className="rounded-lg bg-gray-100 p-2 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
                                    title="Zoom in"
                                >
                                    <ZoomIn className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                                </button>
                            </div>

                            <div
                                className="relative mx-auto max-h-[60vh] w-full overflow-hidden rounded-lg bg-gray-900"
                                onMouseDown={handleMouseDown}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseUp}
                                style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
                            >
                                <img
                                    ref={imgRef}
                                    src={previewUrl ?? undefined}
                                    alt="Preview"
                                    className="w-full select-none"
                                    style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
                                    onLoad={handleImageLoad}
                                    draggable={false}
                                />
                                {crop && (
                                    <div
                                        className="absolute border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]"
                                        style={{
                                            left: crop.x,
                                            top: crop.y,
                                            width: crop.width,
                                            height: crop.height,
                                        }}
                                    />
                                )}
                            </div>

                            <p className="mt-2 text-center text-xs text-gray-600">
                                Geser untuk menyesuaikan posisi. Gunakan zoom untuk memperbesar/memperkecil.
                            </p>

                            <div className="mt-4 flex gap-3">
                                <button
                                    onClick={handleUploadWithoutCrop}
                                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                >
                                    Gunakan Asli
                                </button>
                                <button
                                    onClick={handleCropConfirm}
                                    className="flex-1 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600"
                                >
                                    Simpan
                                </button>
                            </div>
                        </div>
            </BaseModal>
        </>
    );
}
