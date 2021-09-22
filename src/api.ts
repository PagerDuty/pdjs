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
  all: ShorthandCall;
}

export type APIParameters = RequestOptions & {
  endpoint?: string;
  url?: string;
  data?: object;
  token?: string;
  tokenType?: string;
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

  // allows for Token and Bearer token types to be used in Authorization
  type typeMap = {
    [key: string]: string;
  };

  const types: typeMap = {
    bearer: 'Bearer ',
    token: 'Token token=',
  };

  const {
    endpoint,
    server = 'api.pagerduty.com',
    token,
    tokenType = apiParameters.tokenType || 'token',
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
      Authorization: `${types[tokenType]}${token!}`,
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

function apiRequest(url: string, options: RequestOptions): APIPromise {
  return request(url, options).then(
    (response: Response): APIPromise => {
      const apiResponse = response as APIResponse;
      apiResponse.response = response;

      if (response.status === 204) {
        return Promise.resolve(apiResponse);
      }

      return response
        .json()
        .then(
          (data): APIResponse => {
            const resource = resourceKey(url, options.method);
            apiResponse.next = nextFunc(url, options, data);
            apiResponse.data = data;
            apiResponse.resource = resource ? data[resource] : null;
            return apiResponse;
          }
        )
        .catch(() => Promise.reject(apiResponse));
    }
  );
}

function resourceKey(url: string, method?: string) {
  const resource = url.match(/.+.com\/(?<resource>[\w]+)/);
  if (resource) {
    let resourceName = resource[1];
    if (method && method.toLowerCase() === 'get') {
      return resourceName;  
    }
    if (resourceName.endsWith('ies')) {
      return resourceName.slice(0, -3) + 'y'
    } else if (resourceName.endsWith('s')) {
      return resourceName.slice(0, -1);
    }
    return resourceName; 
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

  partial.all = (
    endpoint: string,
    shorthandParameters?: Partial<APIParameters>
  ): APIPromise => {
    function allInner(responses: APIResponse[]): Promise<APIResponse[]> {
      const response = responses[responses.length - 1];
      if (!response.next) {
        // Base case, resolve and return all responses.
        return Promise.resolve(responses);
      }
      // If there are still more resources to get then concat and repeat.
      return response
        .next()
        .then(response => allInner(responses.concat([response])));
    }

    function repackResponses(responses: APIResponse[]): APIPromise {
      // Repack the responses object to make it more user friendly.
      const repackedResponse = responses.shift() as APIResponse; // Use the first response to build the standard response object
      repackedResponse.data = [repackedResponse.data];
      responses.forEach(response => {
        repackedResponse.data = repackedResponse.data.concat(response.data);
        repackedResponse.resource = repackedResponse.resource.concat(
          response.resource
        );
      });
      return Promise.resolve(repackedResponse);
    }

    const method = 'get';
    return (api({
      endpoint,
      method,
      ...partialParameters,
      ...shorthandParameters,
    }) as APIPromise)
      .then(response => allInner([response]))
      .then(responses => repackResponses(responses));
  };

  return partial;
}
