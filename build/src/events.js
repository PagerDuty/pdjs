"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.change = exports.resolve = exports.acknowledge = exports.trigger = exports.event = void 0;
const common_1 = require("./common");
function event(eventParameters) {
    const { server = 'events.pagerduty.com', type = 'event', data, ...config } = eventParameters;
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
exports.event = event;
const shorthand = (action) => (eventParameters) => {
    const typeField = 'event_action';
    return event({
        ...eventParameters,
        data: {
            ...eventParameters.data,
            [typeField]: action,
        },
    });
};
exports.trigger = shorthand('trigger');
exports.acknowledge = shorthand('acknowledge');
exports.resolve = shorthand('resolve');
const change = (eventParameters) => event({ ...eventParameters, type: 'change' });
exports.change = change;
function eventFetch(url, options) {
    return (0, common_1.request)(url, options).then((response) => {
        const apiResponse = response;
        return response.json().then((data) => {
            apiResponse.data = data;
            apiResponse.response = response;
            return apiResponse;
        });
    });
}
//# sourceMappingURL=events.js.map