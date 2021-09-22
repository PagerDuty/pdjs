"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
const common_1 = require("./common");
function api(apiParameters) {
    var _a;
    // If the apiParameters don't include `endpoint` treat it as a partial
    // application.
    if (!apiParameters.endpoint && !apiParameters.url) {
        return partialCall(apiParameters);
    }
    const types = {
        bearer: 'Bearer ',
        token: 'Token token=',
    };
    const { endpoint, server = 'api.pagerduty.com', token, tokenType = apiParameters.tokenType || 'token', url, version = 2, data, ...rest } = apiParameters;
    const config = {
        method: 'GET',
        ...rest,
        headers: {
            Accept: `application/vnd.pagerduty+json;version=${version}`,
            Authorization: `${types[tokenType]}${token}`,
            ...rest.headers,
        },
    };
    // Allow `data` for `queryParameters` for requests without bodies.
    if (isReadonlyRequest(config.method) && data) {
        config.queryParameters =
            (_a = config.queryParameters) !== null && _a !== void 0 ? _a : data;
    }
    else {
        config.body = JSON.stringify(data);
    }
    return apiRequest(url !== null && url !== void 0 ? url : `https://${server}/${endpoint.replace(/^\/+/, '')}`, config);
}
exports.api = api;
function apiRequest(url, options) {
    return (0, common_1.request)(url, options).then((response) => {
        const apiResponse = response;
        apiResponse.response = response;
        if (response.status === 204) {
            return Promise.resolve(apiResponse);
        }
        return response
            .json()
            .then((data) => {
            const resource = resourceKey(url, options.method);
            apiResponse.next = nextFunc(url, options, data);
            apiResponse.data = data;
            apiResponse.resource = resource ? data[resource] : null;
            return apiResponse;
        })
            .catch(() => Promise.reject(apiResponse));
    });
}
function resourceKey(url, method) {
    const resource = url.match(/.+.com\/(?<resource>[\w]+)/);
    if (resource) {
        const resourceName = resource[1];
        if (method && method.toLowerCase() === 'get') {
            return resourceName;
        }
        if (resourceName.endsWith('ies')) {
            return resourceName.slice(0, -3) + 'y';
        }
        else if (resourceName.endsWith('s')) {
            return resourceName.slice(0, -1);
        }
        return resourceName;
    }
    return null;
}
function isReadonlyRequest(method) {
    var _a;
    return !['PUT', 'POST', 'DELETE', 'PATCH'].includes((_a = method.toUpperCase()) !== null && _a !== void 0 ? _a : 'GET');
}
function isOffsetPagination(data) {
    if (data.offset !== undefined) {
        return true;
    }
    return false;
}
function isCursorPagination(data) {
    if (data.cursor !== undefined) {
        return true;
    }
    return false;
}
function nextFunc(url, options, data) {
    if (isOffsetPagination(data)) {
        if ((data === null || data === void 0 ? void 0 : data.more) && typeof data.offset !== undefined && data.limit) {
            return () => apiRequest(url, {
                ...options,
                queryParameters: {
                    ...options.queryParameters,
                    limit: data.limit.toString(),
                    offset: (data.limit + data.offset).toString(),
                },
            });
        }
    }
    else if (isCursorPagination(data)) {
        if (data === null || data === void 0 ? void 0 : data.cursor) {
            return () => apiRequest(url, {
                ...options,
                queryParameters: {
                    ...options.queryParameters,
                    cursor: data.cursor,
                    limit: data.limit.toString(),
                },
            });
        }
    }
    return undefined;
}
function partialCall(apiParameters) {
    const partialParameters = apiParameters;
    const partial = ((apiParameters) => api({ ...partialParameters, ...apiParameters }));
    const shorthand = (method) => (endpoint, shorthandParameters) => api({
        endpoint,
        method,
        ...partialParameters,
        ...shorthandParameters,
    });
    partial.get = shorthand('get');
    partial.post = shorthand('post');
    partial.put = shorthand('put');
    partial.patch = shorthand('patch');
    partial.delete = shorthand('delete');
    partial.all = (endpoint, shorthandParameters) => {
        function allInner(responses) {
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
        function repackResponses(responses) {
            // Repack the responses object to make it more user friendly.
            const repackedResponse = responses.shift(); // Use the first response to build the standard response object
            repackedResponse.data = [repackedResponse.data];
            responses.forEach(response => {
                repackedResponse.data = repackedResponse.data.concat(response.data);
                repackedResponse.resource = repackedResponse.resource.concat(response.resource);
            });
            return Promise.resolve(repackedResponse);
        }
        const method = 'get';
        return api({
            endpoint,
            method,
            ...partialParameters,
            ...shorthandParameters,
        })
            .then(response => allInner([response]))
            .then(responses => repackResponses(responses));
    };
    return partial;
}
//# sourceMappingURL=api.js.map