export interface TestProviderRequest {
    name: string;
    apiKey: string;
    baseUrl?: string | null;
    model?: string | null;
    testPrompt?: string;
}

export interface TestProviderResponse {
    success: boolean;
    response?: string;
    latencyMs?: number;
    model?: string;
    error?: string;
}

export interface ModelMetadata {
    id: string;
    name: string;
    description?: string;
    contextWindow?: number;
    inputCost?: number;
    outputCost?: number;
}

export interface ModelListResponse {
    success: boolean;
    models: ModelMetadata[];
    cached: boolean;
    error?: string;
}
