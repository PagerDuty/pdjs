import { RequestOptions } from './common';
export interface ShorthandCall {
    (res: string, apiParameters?: Partial<APIParameters>): APIPromise;
}
export interface PartialCall {
    (apiParameters: APIParameters): APIPromise;
    (apiParameters: Partial<APIParameters>): PartialCall;
    get: ShorthandCall;
    post: ShorthandCall;
    put: ShorthandCall;
    patch: ShorthandCall;
    delete: ShorthandCall;
    all: ShorthandCall;
}
export declare type APIParameters = RequestOptions & {
    endpoint?: string;
    url?: string;
    data?: object;
    token?: string;
    tokenType?: string;
    server?: string;
    version?: number;
} & ({
    endpoint: string;
} | {
    url: string;
});
export declare type APIPromise = Promise<APIResponse>;
export interface APIResponse extends Response {
    data: any;
    resource: any;
    response: Response;
    next?: () => APIPromise;
}
export declare function api(apiParameters: APIParameters): APIPromise;
export declare function api(apiParameters: Partial<APIParameters>): PartialCall;
