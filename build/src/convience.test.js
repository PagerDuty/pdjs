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
test('Blah blah test retry', async (done) => {
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
    const pd = index_1.api({ token: 'someToken1234567890' });
    const resps = await pd.get('/incidents');
    expect(resps.data).toEqual(body);
    done();
});
//# sourceMappingURL=convience.test.js.map