/* LEGACY-BROWSER-SUPPORT-START */
import fetch, {Headers} from 'cross-fetch';
import {AbortController} from 'abortcontroller-polyfill/dist/cjs-ponyfill';
import {isBrowser} from 'browser-or-node';
/* LEGACY-BROWSER-SUPPORT-END */

const VERSION = '2.0.0';

export interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
  retryCount?: number;
  requestTimeout?: number;
  retryTimeout?: number;
  timeout?: number;
}

export function request(
  url: string | URL,
  options: RequestOptions = {}
): Promise<Response> {
  const {params, requestTimeout = 30000, ...rest} = options;

  url = new URL(url.toString());

  url = applyParams(url, params);
  options = applyTimeout(options, requestTimeout);

  return fetch_retry(url.toString(), 3, {
    ...rest,
    headers: new Headers({
      'Content-Type': 'application/json; charset=utf-8',
      /* LEGACY-BROWSER-SUPPORT-START */
      ...userAgentHeader(),
      /* LEGACY-BROWSER-SUPPORT-END */
      ...rest.headers,
    }),
  });
}

function fetch_retry(
  url: string,
  retries: number,
  options: RequestOptions
): Promise<Response> {
  return new Promise((resolve, reject) => {
    fetch(url, options).then(response => {
      // We don't want to `reject` when retries have finished
      // Instead simply stop trying and return.
      if (retries === 0) return resolve(response);
      if (response.status === 429) {
        const {retryTimeout = 20000} = options;
        retryTimeoutPromise(retryTimeout).then(() => {
          fetch_retry(url, retries - 1, options)
            .then(resolve)
            .catch(reject);
        });
      } else {
        resolve(response);
      }
    });
  });
}

const retryTimeoutPromise = (milliseconds: number) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
};

function userAgentHeader(): object {
  if (isBrowser) return {};

  return {
    'User-Agent': `pdjs/${VERSION} (${process.version}/${process.platform})`,
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
