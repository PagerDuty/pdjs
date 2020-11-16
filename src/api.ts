import {request, RequestOptions} from './common';

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
  all: (apiParameters: APIParameters) => Promise<APIResponse[]>;
}

export type APIParameters = RequestOptions & {
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

export function api(apiParameters: APIParameters): APIPromise;
export function api(apiParameters: Partial<APIParameters>): PartialCall;
export function api(
  apiParameters: Partial<APIParameters>
): APIPromise | PartialCall {
  // If the apiParameters don't include `endpoint` treat it as a partial
  // application.
  if (!apiParameters.endpoint && !apiParameters.url) {
    return partialCall(apiParameters);
  }

  const {
    endpoint,
    server = 'api.pagerduty.com',
    token,
    url,
    version = 2,
    data,
    ...rest
  } = apiParameters;

  const config: RequestOptions = {
    method: 'GET',
    ...rest,
    headers: {
      Accept: `application/vnd.pagerduty+json;version=${version}`,
      Authorization: `Token token=${token!}`,
      ...rest.headers,
    },
  };

  // Allow `data` for `queryParameters` for requests without bodies.
  if (isReadonlyRequest(config.method!) && data) {
    config.queryParameters =
      config.queryParameters ?? (data as Record<string, string>);
  } else {
    config.body = JSON.stringify(data);
  }

  return apiRequest(
    url ?? `https://${server}/${endpoint!.replace(/^\/+/, '')}`,
    config
  );
}

export function all(apiParameters: APIParameters): Promise<APIResponse[]> {
  return (api(apiParameters) as APIPromise).then(response =>
    allInner([response])
  );
}

function allInner(responses: APIResponse[]): Promise<APIResponse[]> {
  const response = responses[responses.length - 1];

  if (!response.next) {
    return Promise.resolve(responses);
  }

  return response
    .next()
    .then(response => allInner(responses.concat([response])));
}

function apiRequest(url: string, options: RequestOptions): APIPromise {
  return request(url, options).then(
    (response: Response): APIPromise => {
      const apiResponse = response as APIResponse;
      apiResponse.response = response;
      const resource = resourceKey(url);
      if (response.status === 200) {
        return response.json().then(
          (data): APIResponse => {
            apiResponse.next = nextFunc(url, options, data);
            apiResponse.data = data;
            apiResponse.resource = resource ? data[resource] : null;
            return apiResponse;
          }
        );
      } else {
        return new Promise((resolve) => {resolve(apiResponse)});
      }
    }
  );
}

function resourceKey(url: string) {
  const resource = url.match(/.+.com\/(?<resource>[\w]+)/);
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

function isOffsetPagination(
  data: OffsetPagination | CursorPagination
): data is OffsetPagination {
  if ((data as OffsetPagination).offset !== undefined) {
    return true;
  }
  return false;
}

function isCursorPagination(
  data: OffsetPagination | CursorPagination
): data is CursorPagination {
  if ((data as CursorPagination).cursor !== undefined) {
    return true;
  }
  return false;
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
          queryParameters: {
            ...options.queryParameters,
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
          queryParameters: {
            ...options.queryParameters,
            cursor: data.cursor!,
            limit: data.limit!.toString(),
          },
        });
    }
  }

  return undefined;
}

function partialCall(apiParameters: Partial<APIParameters>) {
  const partialParameters = apiParameters;
  const partial = ((apiParameters: Partial<APIParameters>) =>
    api({...partialParameters, ...apiParameters})) as PartialCall;

  const shorthand = (method: string) => (
    endpoint: string,
    shorthandParameters?: Partial<APIParameters>
  ): APIPromise =>
    api({
      endpoint,
      method,
      ...partialParameters,
      ...shorthandParameters,
    }) as APIPromise;

  partial.get = shorthand('get');
  partial.post = shorthand('post');
  partial.put = shorthand('put');
  partial.patch = shorthand('patch');
  partial.delete = shorthand('delete');

  partial.all = (apiParameters: APIParameters) => all(apiParameters);

  return partial;
}
