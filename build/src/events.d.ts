import { RequestOptions } from './common';
export declare type Action = 'trigger' | 'acknowledge' | 'resolve';
export declare type EventPromise = Promise<EventResponse>;
export interface EventResponse extends Response {
    data: any;
    response: Response;
}
export declare type Severity = 'critical' | 'error' | 'warning' | 'info';
export interface Image {
    src: string;
    href?: string;
    alt?: string;
}
export interface Link {
    href: string;
    text?: string;
}
export interface EventPayloadV2 {
    routing_key: string;
    event_action: Action;
    dedup_key?: string;
    payload: {
        summary: string;
        source: string;
        severity: Severity;
        timestamp?: string;
        component?: string;
        group?: string;
        class?: string;
        custom_details?: object;
    };
    images?: Array<Image>;
    links?: Array<Link>;
}
export interface EventParameters extends RequestOptions {
    data: EventPayloadV2;
    type?: string;
    server?: string;
}
export interface ChangePayload {
    routing_key: string;
    payload: {
        summary: string;
        source?: string;
        timestamp: string;
        custom_details: object;
    };
    links: Array<Link>;
}
export interface ChangeParameters extends RequestOptions {
    data: ChangePayload;
    server?: string;
}
export declare function event(eventParameters: EventParameters): EventPromise;
export declare const trigger: (eventParameters: EventParameters) => EventPromise;
export declare const acknowledge: (eventParameters: EventParameters) => EventPromise;
export declare const resolve: (eventParameters: EventParameters) => EventPromise;
export declare const change: (eventParameters: EventParameters) => EventPromise;
