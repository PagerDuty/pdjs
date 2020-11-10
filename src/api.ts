import {request, RequestOptions} from './common';

export interface ShorthandCall {
  (res: string, params?: Partial<APIParams>): APIPromise;
}

export interface PartialCall {
  (params: APIParams): APIPromise;
  (params: Partial<APIParams>): PartialCall;
  get: ShorthandCall;
  post: ShorthandCall;
  put: ShorthandCall;
  patch: ShorthandCall;
  delete: ShorthandCall;
  all: (params: APIParams) => Promise<APIResponse[]>;
}

export type APIParams = RequestOptions & {
  endpoint?: string;
  url?: string;
  data?: object;
  token?: string;
  server?: string;
  version?: number;
} & ({endpoint: string} | {url: string});

export type APIPromise = Promise<APIResponse>;

export interface APIResponse extends Response {
  data: any;
  resource: any;
  response: Response;
  next?: () => APIPromise;
}

export function api(params: APIParams): APIPromise;
export function api(params: Partial<APIParams>): PartialCall;
export function api(params: Partial<APIParams>): APIPromise | PartialCall {
  // If the params don't include `endpoint` treat it as a partial
  // application.
  if (!params.endpoint && !params.url) {
    return partialCall(params);
  }

  const {
    endpoint,
    server = 'api.pagerduty.com',
    token,
    url,
    version = 2,
    data,
    ...rest
  } = params;

  const config: RequestOptions = {
    method: 'GET',
    ...rest,
    headers: {
      Accept: `application/vnd.pagerduty+json;version=${version}`,
      Authorization: `Token token=${token!}`,
      ...rest.headers,
    },
  };

  // Allow `data` for `params` for requests without bodies.
  if (isReadonlyRequest(config.method!) && data) {
    config.params = config.params ?? (data as Record<string, string>);
  } else {
    config.body = JSON.stringify(data);
  }

  return apiRequest(
    url ?? `https://${server}/${endpoint!.replace(/^\/+/, '')}`,
    config
  );
}

export function all(params: APIParams): Promise<APIResponse[]> {
  return (api(params) as APIPromise).then(response => allInner([response]));
}

function allInner(responses: APIResponse[]): Promise<APIResponse[]> {
  const response = responses[responses.length - 1];

  if (!response.next) {
    return Promise.resolve(responses);
  }

  return response.next().then(response => allInner(responses.concat([response])));
}

function apiRequest(url: string, options: RequestOptions): APIPromise {
  return request(url, options).then(
    (response: Response): APIPromise => {
      const apiResponse = response as APIResponse;
      const resource = resourceKey(url);
      return response.json().then(
        (data): APIResponse => {
          apiResponse.next = nextFunc(url, options, data);
          apiResponse.data = data;
          apiResponse.resource = resource ? data[resource] : null;
          apiResponse.response = response;
          return apiResponse;
        }
      );
    }
  );
}

function resourceKey(url: string) {
  let resource = url.match(/.+.com\/(?<resource>[\w]+)/);
  if (resource) {
    return resource[1];
  }
  return null;
}

function isReadonlyRequest(method: string) {
  return !['PUT', 'POST', 'DELETE', 'PATCH'].includes(
    method.toUpperCase() ?? 'GET'
  );
}

interface OffsetPagination {
  type: 'offset';
  more?: boolean;
  offset?: number;
  limit?: number;
}

interface CursorPagination {
  type: 'cursor';
  cursor?: string;
  limit?: number;
}

function isOffsetPagination(data: OffsetPagination | CursorPagination): data is OffsetPagination {
  if ((data as OffsetPagination).offset !== undefined) {
    return true
  }
  return false
}

function isCursorPagination(data: OffsetPagination | CursorPagination): data is CursorPagination {
  if ((data as CursorPagination).cursor !== undefined) {
    return true
  }
  return false
}

function nextFunc(
  url: string,
  options: RequestOptions,
  data: OffsetPagination | CursorPagination
) {
  if (isOffsetPagination(data)) {
    if (data?.more && typeof data.offset !== undefined && data.limit) {
      return () =>
        apiRequest(url, {
          ...options,
          params: {
            ...options.params,
            limit: data.limit!.toString(),
            offset: (data.limit! + data.offset!).toString(),
          },
        });
    }
  } else if (isCursorPagination(data)) {
    if (data?.cursor) {
      return () =>
        apiRequest(url, {
          ...options,
          params: {
            ...options.params,
            cursor: data.cursor!,
            limit: data.limit!.toString(),
          }
        })
    }
  }

  return undefined;
}

function partialCall(params: Partial<APIParams>) {
  const partialParams = params;
  const partial = ((params: Partial<APIParams>) =>
    api({...partialParams, ...params})) as PartialCall;

  const shorthand = (method: string) => (
    endpoint: string,
    params?: Partial<APIParams>
  ): APIPromise =>
    api({endpoint, method, ...partialParams, ...params}) as APIPromise;

  partial.get = shorthand('get');
  partial.post = shorthand('post');
  partial.put = shorthand('put');
  partial.patch = shorthand('patch');
  partial.delete = shorthand('delete');

  partial.all = (params: APIParams) => all(params);

  return partial;
}
