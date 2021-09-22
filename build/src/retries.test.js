"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const nock = require("nock");
const index_1 = require("./index");
test('API request should return after 3 rate limited requests', async () => {
    const body = {
        incidents: [],
        limit: 1,
        offset: 0,
        total: null,
        more: true,
    };
    nock('https://api.pagerduty.com')
        .get('/incidents')
        .reply(429, body)
        .get('/incidents')
        .reply(429, body)
        .get('/incidents')
        .reply(429, body)
        .get('/incidents')
        .reply(429, body);
    const response = await (0, index_1.api)({
        token: 'someToken1234567890',
        endpoint: '/incidents',
        retryTimeout: 20,
    });
    expect(response.response.status).toEqual(429);
});
test('API should return data after getting rate limited once.', async () => {
    const body = {
        incidents: [],
        limit: 1,
        offset: 0,
        total: null,
        more: true,
    };
    nock('https://api.pagerduty.com')
        .get('/incidents')
        .reply(429, body)
        .get('/incidents')
        .reply(200, body);
    const response = await (0, index_1.api)({
        token: 'someToken1234567890',
        endpoint: '/incidents',
        retryTimeout: 20,
    });
    expect(response.response.status).toEqual(200);
    expect(response.data).toEqual(body);
});
//# sourceMappingURL=retries.test.js.map