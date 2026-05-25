import { useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Trash2, Upload, X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAvatarUpload } from '../hooks/useAvatarUpload';
import { getInitials, validateAvatarFile } from '../utils/avatar-helpers';

interface AvatarUrls {
    thumbnail: string | null;
    medium: string | null;
    large: string | null;
}

interface Props {
    avatar: AvatarUrls | null;
    userName: string;
    onAvatarChange: (urls: AvatarUrls | null) => void;
}

interface CropState {
    x: number;
    y: number;
    width: number;
    height: number;
}

export default function AvatarSection({ avatar, userName, onAvatarChange }: Props) {
    const { upload, remove, uploading, progress } = useAvatarUpload();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);

    const [showCropModal, setShowCropModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [crop, setCrop] = useState<CropState | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
    const [zoom, setZoom] = useState(1);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const displayUrl = avatar?.large ?? avatar?.medium ?? null;

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const validationError = validateAvatarFile(file);
        if (validationError) {
            toast.error(validationError);
            return;
        }

        setSelectedFile(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        setShowCropModal(true);
        setCrop(null);
        setZoom(1);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, []);

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

    const handleMouseMove = useCallback(
        (e: React.MouseEvent) => {
            if (!isDragging || !crop) return;
            const newX = Math.max(0, Math.min(e.clientX - dragStart.x, imageSize.width - crop.width));
            const newY = Math.max(0, Math.min(e.clientY - dragStart.y, imageSize.height - crop.height));
            setCrop({ ...crop, x: newX, y: newY });
        },
        [isDragging, crop, dragStart, imageSize],
    );

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleCropConfirm = useCallback(async () => {
        if (!selectedFile || !crop || !imgRef.current) return;

        const img = imgRef.current;
        const scaleX = img.naturalWidth / img.clientWidth;
        const scaleY = img.naturalHeight / img.clientHeight;

        const realCrop = {
            x: crop.x * scaleX,
            y: crop.y * scaleY,
            width: crop.width * scaleX,
            height: crop.height * scaleY,
        };

        setShowCropModal(false);
        const urls = await upload(selectedFile, realCrop);
        if (urls) {
            onAvatarChange(urls);
        }
        setSelectedFile(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
    }, [selectedFile, crop, upload, onAvatarChange, previewUrl]);

    const handleUploadWithoutCrop = useCallback(async () => {
        if (!selectedFile) return;
        setShowCropModal(false);
        const urls = await upload(selectedFile);
        if (urls) {
            onAvatarChange(urls);
        }
        setSelectedFile(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
    }, [selectedFile, upload, onAvatarChange, previewUrl]);

    const handleDelete = useCallback(async () => {
        const success = await remove();
        if (success) {
            onAvatarChange(null);
        }
        setShowDeleteConfirm(false);
    }, [remove, onAvatarChange]);

    const handleCloseCrop = useCallback(() => {
        setShowCropModal(false);
        setSelectedFile(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
    }, [previewUrl]);

    return (
        <div className="relative flex flex-col items-center gap-4">
            <motion.div
                className="group relative h-32 w-32 cursor-pointer overflow-hidden rounded-full border-4 border-white/50 bg-gradient-to-br from-blue-400 to-purple-500 shadow-lg dark:border-gray-600"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => fileInputRef.current?.click()}
            >
                {displayUrl ? (
                    <img
                        src={displayUrl}
                        alt={userName}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-white">
                        {getInitials(userName)}
                    </div>
                )}

                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                    <Camera className="h-8 w-8 text-white" />
                </div>
            </motion.div>

            {uploading && (
                <div className="w-32">
                    <div className="h-1.5 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                        <motion.div
                            className="h-full bg-blue-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>
                    <p className="mt-1 text-center text-xs text-gray-500">{progress}%</p>
                </div>
            )}

            <div className="flex gap-2">
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-1.5 rounded-lg bg-blue-500 px-3 py-1.5 text-sm text-white hover:bg-blue-600 disabled:opacity-50"
                >
                    <Upload className="h-3.5 w-3.5" />
                    {displayUrl ? 'Ganti' : 'Unggah'}
                </button>
                {displayUrl && (
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        disabled={uploading}
                        className="flex items-center gap-1.5 rounded-lg bg-red-500/10 px-3 py-1.5 text-sm text-red-500 hover:bg-red-500/20 disabled:opacity-50"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                        Hapus
                    </button>
                )}
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileSelect}
            />

            <AnimatePresence>
                {showCropModal && previewUrl && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                        >
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Potong Avatar
                                </h3>
                                <button
                                    onClick={handleCloseCrop}
                                    className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    <X className="h-5 w-5 text-gray-500" />
                                </button>
                            </div>

                            <div
                                className="relative mb-4 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-900"
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseUp}
                            >
                                <img
                                    ref={imgRef}
                                    src={previewUrl}
                                    alt="Preview"
                                    className="mx-auto max-h-80 object-contain"
                                    style={{ transform: `scale(${zoom})` }}
                                    onLoad={handleImageLoad}
                                    crossOrigin="anonymous"
                                />
                                {crop && (
                                    <div
                                        className="absolute cursor-move border-2 border-dashed border-white"
                                        style={{
                                            left: crop.x,
                                            top: crop.y,
                                            width: crop.width,
                                            height: crop.height,
                                            boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)',
                                        }}
                                        onMouseDown={handleMouseDown}
                                    >
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="rounded-full bg-white/20 p-2">
                                                <Camera className="h-5 w-5 text-white" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="mb-4 flex items-center justify-center gap-4">
                                <button
                                    onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                                    className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    <ZoomOut className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                                </button>
                                <input
                                    type="range"
                                    min="0.5"
                                    max="2"
                                    step="0.01"
                                    value={zoom}
                                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                                    className="w-32"
                                />
                                <button
                                    onClick={() => setZoom(Math.min(2, zoom + 0.1))}
                                    className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    <ZoomIn className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                                </button>
                                <button
                                    onClick={() => setZoom(1)}
                                    className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    <RotateCcw className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                                </button>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={handleUploadWithoutCrop}
                                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                >
                                    Tanpa Potong
                                </button>
                                <button
                                    onClick={handleCropConfirm}
                                    className="flex-1 rounded-lg bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600"
                                >
                                    Potong & Unggah
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showDeleteConfirm && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                        >
                            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                                Hapus Avatar?
                            </h3>
                            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
                                Foto profil Anda akan dihapus dan diganti dengan inisial nama.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="flex-1 rounded-lg bg-red-500 px-4 py-2 text-sm text-white hover:bg-red-600"
                                >
                                    Hapus
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
