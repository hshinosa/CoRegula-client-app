import { StoredNotification } from '@/hooks/useNotificationHistory';

type NotificationEventListener = (notification: StoredNotification) => void;

const listeners: Set<NotificationEventListener> = new Set();

export function onNotification(callback: NotificationEventListener): () => void {
    listeners.add(callback);
    return () => listeners.delete(callback);
}

function dispatch(notification: Omit<StoredNotification, 'source'>): void {
    const entry: StoredNotification = { ...notification, source: 'local' };
    for (const listener of listeners) {
        listener(entry);
    }
}

export const NotificationEvents = {
    userCreated(name: string) {
        dispatch({
            id: `user-created-${Date.now()}`,
            title: 'Pengguna baru',
            message: `${name} telah terdaftar sebagai pengguna baru.`,
            timestamp: new Date().toISOString(),
            read: false,
            type: 'success',
        });
    },

    userUpdated(name: string) {
        dispatch({
            id: `user-updated-${Date.now()}`,
            title: 'Pengguna diperbarui',
            message: `Data pengguna ${name} telah diperbarui.`,
            timestamp: new Date().toISOString(),
            read: false,
            type: 'info',
        });
    },

    courseCreated(courseName: string) {
        dispatch({
            id: `course-created-${Date.now()}`,
            title: 'Mata kuliah baru',
            message: `${courseName} telah ditambahkan.`,
            timestamp: new Date().toISOString(),
            read: false,
            type: 'success',
        });
    },

    courseUpdated(courseName: string) {
        dispatch({
            id: `course-updated-${Date.now()}`,
            title: 'Mata kuliah diperbarui',
            message: `${courseName} telah diperbarui.`,
            timestamp: new Date().toISOString(),
            read: false,
            type: 'info',
        });
    },

    systemAlert(message: string) {
        dispatch({
            id: `system-alert-${Date.now()}`,
            title: 'Peringatan sistem',
            message,
            timestamp: new Date().toISOString(),
            read: false,
            type: 'warning',
        });
    },

    aiSettingsChanged(settingName: string) {
        dispatch({
            id: `ai-settings-${Date.now()}`,
            title: 'Pengaturan AI diperbarui',
            message: `${settingName} telah diubah.`,
            timestamp: new Date().toISOString(),
            read: false,
            type: 'info',
        });
    },

    templateCreated(name: string) {
        dispatch({
            id: `template-created-${Date.now()}`,
            title: 'Template baru',
            message: `${name} telah dibuat.`,
            timestamp: new Date().toISOString(),
            read: false,
            type: 'success',
        });
    },

    bulkImportDone(count: number) {
        dispatch({
            id: `bulk-import-${Date.now()}`,
            title: 'Impor selesai',
            message: `${count} data berhasil diimpor.`,
            timestamp: new Date().toISOString(),
            read: false,
            type: 'success',
        });
    },
};
