/* NODE-ONLY-START */
import fetch, {Headers} from 'cross-fetch';
import {isBrowser} from 'browser-or-node';
/* NODE-ONLY-END */

const VERSION = '0.0.1';

export interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
  timeout?: number;
}

// TODO: Retries.
// TODO: Backoff.
export function request(
  url: string | URL,
  options: RequestOptions = {}
): Promise<Response> {
  const {params, timeout, ...rest} = options;

  url = new URL(url.toString());

  url = applyParams(url, params);
  options = applyTimeout(options, timeout);

  return fetch(url.toString(), {
    ...rest,
    headers: new Headers({
      'Content-Type': 'application/json; charset=utf-8',
      /* NODE-ONLY-START */
      ...userAgentHeader(),
      /* NODE-ONLY-END */
      ...rest.headers,
    }),
  });
}

function userAgentHeader(): object {
  if (isBrowser) return {};

  return {
    'User-Agent': `pdjs-next/${VERSION} (${process.version}/${process.platform})`,
  };
}

function applyParams(url: URL, params?: Record<string, string>): URL {
  if (!params) return url;

  const combinedParams = url.searchParams;

  for (const key of Object.keys(params)) {
    combinedParams.append(key, params[key]);
  }

  url.search = combinedParams.toString();
  return url;
}

function applyTimeout(init: RequestOptions, timeout?: number): RequestOptions {
  if (!timeout) return init;

  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeout);

  return {
    ...init,
    signal: controller.signal,
  };
}
