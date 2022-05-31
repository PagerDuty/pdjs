declare type QueryParameter = Record<string, string | Array<string>>;
interface RequestInit {
    body?: BodyInit | null;
    cache?: RequestCache;
    credentials?: RequestCredentials;
    headers?: HeadersInit;
    integrity?: string;
    keepalive?: boolean;
    method?: string;
    mode?: RequestMode;
    redirect?: RequestRedirect;
    referrer?: string;
    referrerPolicy?: ReferrerPolicy;
    signal?: AbortSignal | null;
    window?: null;
}
export interface RequestOptions extends RequestInit {
    queryParameters?: QueryParameter;
    retryCount?: number;
    requestTimeout?: number;
    requestTimer?: any;
    retryTimeout?: number;
    timeout?: number;
}
export declare function request(url: string | URL, options?: RequestOptions): Promise<Response>;
export {};
