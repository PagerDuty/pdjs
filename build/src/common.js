"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.request = void 0;
/* LEGACY-BROWSER-SUPPORT-START */
const cross_fetch_1 = require("cross-fetch");
const cjs_ponyfill_1 = require("abortcontroller-polyfill/dist/cjs-ponyfill");
const browser_or_node_1 = require("browser-or-node");
/* LEGACY-BROWSER-SUPPORT-END */
const VERSION = '2.0.0';
function request(url, options = {}) {
    const { queryParameters, requestTimeout = 30000, ...rest } = options;
    url = new URL(url.toString());
    url = applyParameters(url, queryParameters);
    options = applyTimeout(options, requestTimeout);
    return fetch_retry(url.toString(), 3, {
        ...rest,
        headers: new cross_fetch_1.Headers({
            'Content-Type': 'application/json; charset=utf-8',
            /* LEGACY-BROWSER-SUPPORT-START */
            ...userAgentHeader(),
            /* LEGACY-BROWSER-SUPPORT-END */
            ...rest.headers,
        }),
    });
}
exports.request = request;
function fetch_retry(url, retries, options) {
    return new Promise((resolve, reject) => {
        cross_fetch_1.default(url, options).then(response => {
            // We don't want to `reject` when retries have finished
            // Instead simply stop trying and return.
            if (retries === 0)
                return resolve(response);
            if (response.status === 429) {
                const { retryTimeout = 20000 } = options;
                retryTimeoutPromise(retryTimeout).then(() => {
                    fetch_retry(url, retries - 1, options)
                        .then(resolve)
                        .catch(reject);
                });
            }
            else {
                resolve(response);
            }
        });
    });
}
const retryTimeoutPromise = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
};
function userAgentHeader() {
    if (browser_or_node_1.isBrowser)
        return {};
    return {
        'User-Agent': `pdjs/${VERSION} (${process.version}/${process.platform})`,
    };
}
function applyParameters(url, queryParameters) {
    if (!queryParameters)
        return url;
    const combinedParameters = url.searchParams;
    for (const key of Object.keys(queryParameters)) {
        const parameter = queryParameters[key];
        if (Array.isArray(parameter)) {
            // Support for array based keys like `additional_fields[]`
            parameter.forEach(item => {
                combinedParameters.append(key, item);
            });
        }
        else {
            combinedParameters.append(key, parameter);
        }
    }
    url.search = combinedParameters.toString();
    return url;
}
function applyTimeout(init, timeout) {
    if (!timeout)
        return init;
    const controller = new cjs_ponyfill_1.AbortController();
    setTimeout(() => controller.abort(), timeout);
    return {
        ...init,
        signal: controller.signal,
    };
}
//# sourceMappingURL=common.js.map