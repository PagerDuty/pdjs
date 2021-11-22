"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.request = void 0;
/* LEGACY-BROWSER-SUPPORT-START */
const cross_fetch_1 = require("cross-fetch");
const browser_or_node_1 = require("browser-or-node");
/* LEGACY-BROWSER-SUPPORT-END */
const VERSION = '2.0.0';
function request(url, options = {}) {
    const { queryParameters, requestTimeout = 30000 } = options;
    url = new URL(url.toString());
    url = applyParameters(url, queryParameters);
    options = applyTimeout(options, requestTimeout);
    return fetch_retry(url.toString(), 3, {
        ...options,
        headers: new cross_fetch_1.Headers({
            'Content-Type': 'application/json; charset=utf-8',
            /* LEGACY-BROWSER-SUPPORT-START */
            ...userAgentHeader(),
            /* LEGACY-BROWSER-SUPPORT-END */
            ...options.headers,
        }),
    });
}
exports.request = request;
function fetch_retry(url, retries, options) {
    return new Promise((resolve, reject) => {
        (0, cross_fetch_1.default)(url, options)
            .then(response => {
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
                clearTimeout(options.requestTimer);
                resolve(response);
            }
        })
            .catch(reject);
    });
}
const retryTimeoutPromise = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
};
function userAgentHeader() {
    if (browser_or_node_1.isNode) {
        return {
            'User-Agent': `pdjs/${VERSION} (${process.version}/${process.platform})`,
        };
    }
    else if (browser_or_node_1.isWebWorker) {
        return {
            'User-Agent': `pdjs/${VERSION} (WebWorker)`,
        };
    }
    else if (browser_or_node_1.isJsDom) {
        return {
            'User-Agent': `pdjs/${VERSION} (JsDom)`,
        };
    }
    else if (browser_or_node_1.isDeno) {
        return {
            'User-Agent': `pdjs/${VERSION} (Deno)`,
        };
    }
    else if (browser_or_node_1.isBrowser) {
        return {
            // Note: This will not work consistently for all browsers as some silently drop the userAgent Header.
            'User-Agent': `pdjs/${VERSION} (${window.navigator.userAgent})`,
        };
    }
    else {
        return {};
    }
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
    const timer = setTimeout(() => { }, timeout);
    return {
        ...init,
        requestTimer: timer,
    };
}
//# sourceMappingURL=common.js.map