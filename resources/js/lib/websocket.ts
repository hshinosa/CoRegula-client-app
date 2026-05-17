import { getAuthToken } from '@/lib/getAuthToken';

export type AdminWebSocketEvent<T = unknown> = {
    event: string;
    data: T;
};

function resolveWebSocketUrl() {
    const baseUrl =
        import.meta.env.VITE_WS_URL ||
        import.meta.env.VITE_SOCKET_URL ||
        import.meta.env.VITE_API_BASE_URL ||
        'http://localhost:3000';

    const normalizedUrl = baseUrl.startsWith('http')
        ? new URL(baseUrl)
        : new URL(`http://${baseUrl}`);

    normalizedUrl.protocol = normalizedUrl.protocol === 'https:' ? 'wss:' : 'ws:';
    normalizedUrl.pathname = '/ws';

    return normalizedUrl.toString();
}

export async function connectWebSocket(options?: {
    onOpen?: () => void;
    onClose?: () => void;
    onError?: (event: Event) => void;
    onMessage?: <T>(message: AdminWebSocketEvent<T>) => void;
}) {
    const token = await getAuthToken();
    const socket = new WebSocket(resolveWebSocketUrl());

    socket.addEventListener('open', () => {
        socket.send(JSON.stringify({ event: 'auth', data: { token } }));
        options?.onOpen?.();
    });

    socket.addEventListener('close', () => {
        options?.onClose?.();
    });

    socket.addEventListener('error', (event) => {
        options?.onError?.(event);
    });

    socket.addEventListener('message', (event) => {
        try {
            const payload = JSON.parse(event.data) as AdminWebSocketEvent;
            options?.onMessage?.(payload);
        } catch {
        }
    });

    return socket;
}
