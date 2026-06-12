import type { ChatDisplayMessage } from '@/types/chat';

const DATABASE_NAME = 'kolabri-outbox';
const DATABASE_VERSION = 1;
const STORE_NAME = 'messages';

export interface OutboxMessagePayload {
    roomId: string;
    courseId: string;
    groupId: string;
    clientId?: string;
    content: string;
    replyTo?: ChatDisplayMessage['reply_to'];
    attachments?: ChatDisplayMessage['attachments'];
    mentions?: string[];
}

export interface OutboxMessageRecord {
    id: string;
    conversationId: string;
    timestamp: number;
    message: ChatDisplayMessage;
    payload: OutboxMessagePayload;
}

function openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        if (typeof window === 'undefined' || !('indexedDB' in window)) {
            reject(new Error('IndexedDB unavailable'));
            return;
        }

        const request = window.indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

        request.onupgradeneeded = () => {
            const database = request.result;

            if (!database.objectStoreNames.contains(STORE_NAME)) {
                const store = database.createObjectStore(STORE_NAME, { keyPath: 'id' });
                store.createIndex('conversationId', 'conversationId', { unique: false });
                store.createIndex('timestamp', 'timestamp', { unique: false });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error ?? new Error('Failed to open IndexedDB'));
    });
}

async function withStore<T>(mode: IDBTransactionMode, handler: (store: IDBObjectStore, resolve: (value: T) => void, reject: (reason?: unknown) => void) => void): Promise<T> {
    const database = await openDatabase();

    return new Promise<T>((resolve, reject) => {
        const transaction = database.transaction(STORE_NAME, mode);
        const store = transaction.objectStore(STORE_NAME);

        transaction.oncomplete = () => database.close();
        transaction.onerror = () => reject(transaction.error ?? new Error('IndexedDB transaction failed'));
        transaction.onabort = () => reject(transaction.error ?? new Error('IndexedDB transaction aborted'));

        handler(store, resolve, reject);
    });
}

export const outboxRepository = {
    async add(message: OutboxMessageRecord): Promise<OutboxMessageRecord | null> {
        try {
            return await withStore<OutboxMessageRecord | null>('readwrite', (store, resolve, reject) => {
                const request = store.put(message);
                request.onsuccess = () => resolve(message);
                request.onerror = () => reject(request.error ?? new Error('Failed to add outbox message'));
            });
        } catch {
            return null;
        }
    },

    async getAll(): Promise<OutboxMessageRecord[]> {
        try {
            return await withStore<OutboxMessageRecord[]>('readonly', (store, resolve, reject) => {
                const request = store.getAll();
                request.onsuccess = () => {
                    const messages = (request.result as OutboxMessageRecord[] | undefined) ?? [];
                    resolve(messages.sort((left, right) => left.timestamp - right.timestamp));
                };
                request.onerror = () => reject(request.error ?? new Error('Failed to read outbox messages'));
            });
        } catch {
            return [];
        }
    },

    async remove(id: string): Promise<boolean> {
        try {
            return await withStore<boolean>('readwrite', (store, resolve, reject) => {
                const request = store.delete(id);
                request.onsuccess = () => resolve(true);
                request.onerror = () => reject(request.error ?? new Error('Failed to remove outbox message'));
            });
        } catch {
            return false;
        }
    },

    async removeMany(ids: string[]): Promise<string[]> {
        try {
            return await withStore<string[]>('readwrite', (store, resolve, reject) => {
                if (ids.length === 0) {
                    resolve([]);
                    return;
                }

                let completed = 0;
                let failed = false;

                ids.forEach((id) => {
                    const request = store.delete(id);
                    request.onsuccess = () => {
                        completed += 1;
                        if (!failed && completed === ids.length) {
                            resolve(ids);
                        }
                    };
                    request.onerror = () => {
                        if (failed) {
                            return;
                        }
                        failed = true;
                        reject(request.error ?? new Error('Failed to remove multiple outbox messages'));
                    };
                });
            });
        } catch {
            return [];
        }
    },
};
