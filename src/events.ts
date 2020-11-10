import {request, RequestOptions} from './common';

export type Action = 'trigger' | 'acknowledge' | 'resolve';

export type EventPromise = Promise<EventResponse>;

export interface EventResponse extends Response {
  data: any;
}

export type Severity = 'critical' | 'error' | 'warning' | 'info';

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

export interface EventParams extends RequestOptions {
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
export interface ChangeParams extends RequestOptions {
  data: ChangePayload;
  server?: string;
}

export function event(params: EventParams): EventPromise {
  const {
    server = 'events.pagerduty.com',
    type = 'event',
    data,
    ...config
  } = params;

  let url = `https://${server}/v2/enqueue`;
  if (type === 'change') {
    url = `https://${server}/v2/change/enqueue`;
  }

  return eventFetch(url, {
    method: 'POST',
    body: JSON.stringify(data),
    ...config,
  });
}

const shorthand = (action: Action) => (params: EventParams): EventPromise => {
  const typeField = 'event_action';

  return event({
    ...params,
    data: {
      ...params.data,
      [typeField]: action,
    },
  });
};

export const trigger = shorthand('trigger');
export const acknowledge = shorthand('acknowledge');
export const resolve = shorthand('resolve');
export const change = (params: EventParams) =>
  event({...params, type: 'change'});

async function eventFetch(url: string, options: RequestOptions): EventPromise {
  const resp = (await request(url, options)) as EventResponse;
  resp.data = await resp.json();
  // TODO: Something with the return data data.
  return resp;
}
