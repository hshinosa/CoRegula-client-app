function wait(delayMs: number) {
    return new Promise((resolve) => window.setTimeout(resolve, delayMs));
}

export async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxAttempts = 3,
    baseDelay = 1000,
    maxDelay = 4000,
    jitterMs = 500,
): Promise<{ result: T; attempts: number }> {
    let lastError: unknown;

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
        try {
            const result = await fn();
            return { result, attempts: attempt + 1 };
        } catch (error) {
            lastError = error;

            if (attempt === maxAttempts - 1) {
                break;
            }

            const delayMs = Math.min(baseDelay * 2 ** attempt, maxDelay) + Math.random() * jitterMs;
            await wait(delayMs);
        }
    }

    throw lastError instanceof Error ? lastError : new Error('Retry attempts exhausted');
}
