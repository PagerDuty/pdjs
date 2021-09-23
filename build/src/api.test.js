"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const nock = require("nock");
const index_1 = require("./index");
const EMPTY_BODY = {
    incidents: [],
    limit: 25,
    offset: 0,
    total: null,
    more: false,
};
test('API calls return JSON for basic API calls with server', async () => {
    nock('https://api.pagerduty.com', {
        reqheaders: {
            Authorization: 'Token token=someToken1234567890',
            'User-Agent': header => header.startsWith('pdjs'),
        },
    })
        .get('/incidents')
        .reply(200, EMPTY_BODY);
    const resp = await (0, index_1.api)({
        token: 'someToken1234567890',
        server: 'api.pagerduty.com',
        endpoint: 'incidents',
    });
    expect(resp.url).toEqual('https://api.pagerduty.com/incidents');
    expect(resp.data).toEqual(EMPTY_BODY);
});
test('API calls return JSON for basic API calls with url', async () => {
    nock('https://api.pagerduty.com', {
        reqheaders: {
            Authorization: 'Token token=someToken1234567890',
            'User-Agent': header => header.startsWith('pdjs'),
        },
    })
        .get('/incidents')
        .reply(200, EMPTY_BODY);
    const resp = await (0, index_1.api)({
        token: 'someToken1234567890',
        url: 'https://api.pagerduty.com/incidents',
    });
    expect(resp.url).toEqual('https://api.pagerduty.com/incidents');
    expect(resp.data).toEqual(EMPTY_BODY);
});
test('API calls return JSON for basic API calls with endpoint', async () => {
    nock('https://api.pagerduty.com', {
        reqheaders: {
            Authorization: 'Token token=someToken1234567890',
            'User-Agent': header => header.startsWith('pdjs'),
        },
    })
        .get('/incidents')
        .reply(200, EMPTY_BODY);
    const resp = await (0, index_1.api)({
        token: 'someToken1234567890',
        endpoint: 'incidents',
    });
    expect(resp.url).toEqual('https://api.pagerduty.com/incidents');
    expect(resp.data).toEqual(EMPTY_BODY);
});
test('API calls return successfully on DELETE endpoints', async () => {
    nock('https://api.pagerduty.com', {
        reqheaders: {
            Authorization: 'Token token=someToken1234567890',
            'User-Agent': header => header.startsWith('pdjs'),
        },
    })
        .delete('/incidents/delete')
        .reply(204);
    const pd = (0, index_1.api)({ token: 'someToken1234567890' });
    const response = await pd.delete('/incidents/delete');
    expect(response.url).toEqual('https://api.pagerduty.com/incidents/delete');
    expect(response.data).toEqual(undefined);
});
test('API calls support partial application with url', async () => {
    nock('https://api.pagerduty.com', {
        reqheaders: {
            Authorization: 'Token token=someToken1234567890',
            'User-Agent': header => header.startsWith('pdjs'),
        },
    })
        .get('/incidents')
        .reply(200, EMPTY_BODY);
    const pd = (0, index_1.api)({ token: 'someToken1234567890' });
    const resp = await pd({
        url: 'https://api.pagerduty.com/incidents',
    });
    expect(resp.url).toEqual('https://api.pagerduty.com/incidents');
    expect(resp.data).toEqual(EMPTY_BODY);
});
test('API calls support partial application with convenience methods', async () => {
    nock('https://api.pagerduty.com', {
        reqheaders: {
            Authorization: 'Token token=someToken1234567890',
            'User-Agent': header => header.startsWith('pdjs'),
        },
    })
        .get('/incidents')
        .reply(200, EMPTY_BODY);
    const resp = await (0, index_1.api)({ token: 'someToken1234567890' }).get('/incidents');
    expect(resp.url).toEqual('https://api.pagerduty.com/incidents');
    expect(resp.data).toEqual(EMPTY_BODY);
});
test('API calls use data in place of queryParameters when provided on GET requests', async () => {
    nock('https://api.pagerduty.com')
        .get('/incidents?sort_by=created_at&total=true')
        .reply(200, EMPTY_BODY);
    const resp = await (0, index_1.api)({
        token: 'someToken1234567890',
        endpoint: '/incidents',
        data: { sort_by: 'created_at', total: true },
    });
    expect(resp.url).toEqual('https://api.pagerduty.com/incidents?sort_by=created_at&total=true');
    expect(resp.data).toEqual(EMPTY_BODY);
});
test('API calls populate resource field', async () => {
    nock('https://api.pagerduty.com')
        .get('/incidents')
        .reply(200, {
        incidents: ['one', 1, null],
        limit: 25,
        offset: 0,
        total: null,
        more: false,
    });
    nock('https://api.pagerduty.com')
        .post('/incidents')
        .reply(201, {
        incident: ['some incident'],
    });
    const respGet = await (0, index_1.api)({
        token: 'someToken1234567890',
        endpoint: '/incidents',
    });
    expect(respGet.resource).toEqual(['one', 1, null]);
    const respPost = await (0, index_1.api)({
        token: 'someToken1234567890',
        endpoint: '/incidents',
        method: 'POST',
    });
    expect(respPost.resource).toEqual(['some incident']);
});
test('API explodes list based parameters properly', async () => {
    nock('https://api.pagerduty.com')
        .get('/incidents?additional_fields[]=one&additional_fields[]=two&additional_fields[]=three')
        .reply(200, {
        incidents: ['one', 1, null],
        limit: 25,
        offset: 0,
        total: null,
        more: false,
    });
    const resp = await (0, index_1.api)({
        token: 'someToken1234567890',
        endpoint: '/incidents',
        queryParameters: {
            'additional_fields[]': ['one', 'two', 'three'],
        },
    });
    expect(resp.url).toEqual('https://api.pagerduty.com/incidents?additional_fields%5B%5D=one&additional_fields%5B%5D=two&additional_fields%5B%5D=three');
});
test('API `all` calls for offset should generate requests until no more results', async () => {
    nock('https://api.pagerduty.com')
        .get('/incidents?limit=1')
        .reply(200, {
        incidents: [{ name: 1 }],
        limit: 1,
        offset: 0,
        more: true,
        total: null,
    });
    nock('https://api.pagerduty.com')
        .get('/incidents?limit=1&offset=1')
        .reply(200, {
        incidents: [{ name: 2 }],
        limit: 1,
        offset: 1,
        more: true,
        total: null,
    });
    nock('https://api.pagerduty.com')
        .get('/incidents?limit=1&offset=2')
        .reply(200, {
        incidents: [{ name: 3 }],
        limit: 1,
        offset: 2,
        more: false,
        total: null,
    });
    const pd = (0, index_1.api)({ token: 'someToken1234567890' });
    const responses = await pd.all('/incidents', { data: { limit: 1 } });
    expect(responses.resource).toEqual([{ name: 1 }, { name: 2 }, { name: 3 }]);
});
test('API `all` calls for cursor should generate requests until no more results', async () => {
    nock('https://api.pagerduty.com')
        .get('/incidents?limit=1')
        .reply(200, {
        incidents: [{ name: 1 }],
        limit: 1,
        cursor: 'one',
    });
    nock('https://api.pagerduty.com')
        .get('/incidents?limit=1&cursor=one')
        .reply(200, {
        incidents: [{ name: 2 }],
        limit: 1,
        cursor: 'two',
    });
    nock('https://api.pagerduty.com')
        .get('/incidents?limit=1&cursor=two')
        .reply(200, {
        incidents: [{ name: 3 }],
        limit: 1,
        cursor: null,
    });
    const pd = (0, index_1.api)({ token: 'someToken1234567890' });
    const responses = await pd.all('/incidents', {
        data: { limit: 1 },
    });
    expect(responses.resource).toEqual([{ name: 1 }, { name: 2 }, { name: 3 }]);
});
test('API `get` calls with shorthand `get` should succeed', async () => {
    nock('https://api.pagerduty.com').get('/incidents').reply(200, EMPTY_BODY);
    const pd = (0, index_1.api)({ token: 'someToken1234567890' });
    const response = await pd.get('/incidents');
    expect(response.url).toEqual('https://api.pagerduty.com/incidents');
    expect(response.data).toEqual(EMPTY_BODY);
});
test('API `post` calls with shorthand `get` should succeed', async () => {
    nock('https://api.pagerduty.com').post('/incidents').reply(200, EMPTY_BODY);
    const pd = (0, index_1.api)({ token: 'someToken1234567890' });
    const response = await pd.post('/incidents');
    expect(response.url).toEqual('https://api.pagerduty.com/incidents');
    expect(response.data).toEqual(EMPTY_BODY);
});
test('API `put` calls with shorthand `get` should succeed', async () => {
    nock('https://api.pagerduty.com').put('/incidents').reply(200, EMPTY_BODY);
    const pd = (0, index_1.api)({ token: 'someToken1234567890' });
    const response = await pd.put('/incidents');
    expect(response.url).toEqual('https://api.pagerduty.com/incidents');
    expect(response.data).toEqual(EMPTY_BODY);
});
test('API `patch` calls with shorthand `get` should succeed', async () => {
    nock('https://api.pagerduty.com').patch('/incidents').reply(200, EMPTY_BODY);
    const pd = (0, index_1.api)({ token: 'someToken1234567890' });
    const response = await pd.patch('/incidents');
    expect(response.url).toEqual('https://api.pagerduty.com/incidents');
    expect(response.data).toEqual(EMPTY_BODY);
});
test('API `delete` calls with shorthand `get` should succeed', async () => {
    nock('https://api.pagerduty.com').delete('/incidents').reply(200, EMPTY_BODY);
    const pd = (0, index_1.api)({ token: 'someToken1234567890' });
    const response = await pd.delete('/incidents');
    expect(response.url).toEqual('https://api.pagerduty.com/incidents');
    expect(response.data).toEqual(EMPTY_BODY);
});
test('API catches ETIMEDOUT error', async () => {
    nock('https://api.pagerduty.com')
        .get('/incidents')
        .replyWithError({ code: 'ETIMEDOUT' });
    const pd = (0, index_1.api)({ token: 'someToken1234567890' });
    await expect(pd.get('/incidents')).rejects.toThrow('request to https://api.pagerduty.com/incidents failed, reason: undefined');
});
//# sourceMappingURL=api.test.js.map