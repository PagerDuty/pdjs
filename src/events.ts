import {request, RequestOptions} from './common';

export type Action = 'trigger' | 'acknowledge' | 'resolve';

export type EventPromise = Promise<EventResponse>;

export interface EventResponse extends Response {
  data: any;
  response: Response;
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

export function event(eventParameters: EventParameters): EventPromise {
  const {
    server = 'events.pagerduty.com',
    type = 'event',
    data,
    ...config
  } = eventParameters;

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

const shorthand =
  (action: Action) =>
  (eventParameters: EventParameters): EventPromise => {
    const typeField = 'event_action';

    return event({
      ...eventParameters,
      data: {
        ...eventParameters.data,
        [typeField]: action,
      },
    });
  };

export const trigger = shorthand('trigger');
export const acknowledge = shorthand('acknowledge');
export const resolve = shorthand('resolve');
export const change = (eventParameters: EventParameters) =>
  event({...eventParameters, type: 'change'});

function eventFetch(url: string, options: RequestOptions): EventPromise {
  return request(url, options).then((response: Response): EventPromise => {
    const apiResponse = response as EventResponse;
    return response.json().then((data): EventResponse => {
      apiResponse.data = data;
      apiResponse.response = response;
      return apiResponse;
    });
  });
}
