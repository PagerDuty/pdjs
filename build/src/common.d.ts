declare type QueryParameter = Record<string, string | Array<string>>;
export interface RequestOptions extends RequestInit {
    queryParameters?: QueryParameter;
    retryCount?: number;
    requestTimeout?: number;
    retryTimeout?: number;
    timeout?: number;
}
export declare function request(url: string | URL, options?: RequestOptions): Promise<Response>;
export {};
