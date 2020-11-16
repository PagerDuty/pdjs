import nock = require('nock');
import {all, api} from './index';

const EMPTY_BODY = {
  incidents: [],
  limit: 25,
  offset: 0,
  total: null,
  more: false,
};

test('API calls return JSON for basic API calls with server', async done => {
  nock('https://api.pagerduty.com', {
    reqheaders: {
      Authorization: 'Token token=someToken1234567890',
      'User-Agent': header => header.startsWith('pdjs'),
    },
  })
    .get('/incidents')
    .reply(200, EMPTY_BODY);

  const resp = await api({
    token: 'someToken1234567890',
    server: 'api.pagerduty.com',
    endpoint: 'incidents',
  });

  expect(resp.url).toEqual('https://api.pagerduty.com/incidents');
  expect(resp.data).toEqual(EMPTY_BODY);
  done();
});

test('API calls return JSON for basic API calls with url', async done => {
  nock('https://api.pagerduty.com', {
    reqheaders: {
      Authorization: 'Token token=someToken1234567890',
      'User-Agent': header => header.startsWith('pdjs'),
    },
  })
    .get('/incidents')
    .reply(200, EMPTY_BODY);

  const resp = await api({
    token: 'someToken1234567890',
    url: 'https://api.pagerduty.com/incidents',
  });

  expect(resp.url).toEqual('https://api.pagerduty.com/incidents');
  expect(resp.data).toEqual(EMPTY_BODY);
  done();
});

test('API calls return JSON for basic API calls with endpoint', async done => {
  nock('https://api.pagerduty.com', {
    reqheaders: {
      Authorization: 'Token token=someToken1234567890',
      'User-Agent': header => header.startsWith('pdjs'),
    },
  })
    .get('/incidents')
    .reply(200, EMPTY_BODY);

  const resp = await api({
    token: 'someToken1234567890',
    endpoint: 'incidents',
  });

  expect(resp.url).toEqual('https://api.pagerduty.com/incidents');
  expect(resp.data).toEqual(EMPTY_BODY);
  done();
});

test('API calls support partial application with url', async done => {
  nock('https://api.pagerduty.com', {
    reqheaders: {
      Authorization: 'Token token=someToken1234567890',
      'User-Agent': header => header.startsWith('pdjs'),
    },
  })
    .get('/incidents')
    .reply(200, EMPTY_BODY);

  const pd = api({token: 'someToken1234567890'});
  const resp = await pd({
    url: 'https://api.pagerduty.com/incidents',
  });

  expect(resp.url).toEqual('https://api.pagerduty.com/incidents');
  expect(resp.data).toEqual(EMPTY_BODY);
  done();
});

test('API calls support partial application with convenience methods', async done => {
  nock('https://api.pagerduty.com', {
    reqheaders: {
      Authorization: 'Token token=someToken1234567890',
      'User-Agent': header => header.startsWith('pdjs'),
    },
  })
    .get('/incidents')
    .reply(200, EMPTY_BODY);

  const resp = await api({token: 'someToken1234567890'}).get('/incidents');

  expect(resp.url).toEqual('https://api.pagerduty.com/incidents');
  expect(resp.data).toEqual(EMPTY_BODY);
  done();
});

test('API calls use data in place of queryParameters when provided on GET requests', async done => {
  nock('https://api.pagerduty.com')
    .get('/incidents?sort_by=created_at&total=true')
    .reply(200, EMPTY_BODY);

  const resp = await api({
    token: 'someToken1234567890',
    endpoint: '/incidents',
    data: {sort_by: 'created_at', total: true},
  });

  expect(resp.url).toEqual(
    'https://api.pagerduty.com/incidents?sort_by=created_at&total=true'
  );
  expect(resp.data).toEqual(EMPTY_BODY);
  done();
});

test('API calls populate resource field', async done => {
  nock('https://api.pagerduty.com')
    .get('/incidents')
    .reply(200, {
      incidents: ['one', 1, null],
      limit: 25,
      offset: 0,
      total: null,
      more: false,
    });

  const resp = await api({
    token: 'someToken1234567890',
    endpoint: '/incidents',
  });
  expect(resp.resource).toEqual(['one', 1, null]);
  done();
});

test('API explodes list based parameters properly', async done => {
  nock('https://api.pagerduty.com')
    .get(
      '/incidents?additional_fields[]=one&additional_fields[]=two&additional_fields[]=three'
    )
    .reply(200, {
      incidents: ['one', 1, null],
      limit: 25,
      offset: 0,
      total: null,
      more: false,
    });

  const resp = await api({
    token: 'someToken1234567890',
    endpoint: '/incidents',
    queryParameters: {
      'additional_fields[]': ['one', 'two', 'three'],
    },
  });

  expect(resp.url).toEqual(
    `https://api.pagerduty.com/incidents?additional_fields%5B%5D=one&additional_fields%5B%5D=two&additional_fields%5B%5D=three`
  );
  done();
});

test('API `all` calls for offset should generate requests until no more results', async done => {
  const body = {
    incidents: [],
    limit: 1,
    offset: 0,
    total: null,
    more: true,
  };

  nock('https://api.pagerduty.com').get('/incidents?limit=1').reply(200, body);

  nock('https://api.pagerduty.com')
    .get('/incidents?limit=1&offset=1')
    .reply(200, {
      ...body,
      offset: 1,
    });

  nock('https://api.pagerduty.com')
    .get('/incidents?limit=1&offset=2')
    .reply(200, {
      ...body,
      offset: 2,
      more: false,
    });

  const resps = await all({
    token: 'someToken1234567890',
    endpoint: '/incidents',
    data: {limit: 1},
  });

  expect(resps.length).toEqual(3);
  expect(resps[0].data.offset).toEqual(0);
  expect(resps[1].data.offset).toEqual(1);
  expect(resps[2].data.offset).toEqual(2);
  done();
});

test('API `all` calls for cursor should generate requests until no more results', async done => {
  const body = {
    incidents: [],
    limit: 1,
    cursor: 'one',
  };

  nock('https://api.pagerduty.com').get('/incidents?limit=1').reply(200, body);

  nock('https://api.pagerduty.com')
    .get('/incidents?limit=1&cursor=one')
    .reply(200, {
      ...body,
      cursor: 'two',
    });

  nock('https://api.pagerduty.com')
    .get('/incidents?limit=1&cursor=two')
    .reply(200, {
      ...body,
      cursor: null,
    });

  const responses = await all({
    token: 'someToken1234567890',
    endpoint: '/incidents',
    data: {limit: 1},
  });

  expect(responses.length).toEqual(3);
  expect(responses[0].data.cursor).toEqual('one');
  expect(responses[1].data.cursor).toEqual('two');
  expect(responses[2].data.offset).toEqual(undefined);
  done();
});

test('API `all` calls on partials should generate requests until no more results', async done => {
  const body = {
    incidents: [],
    limit: 1,
    offset: 0,
    total: null,
    more: true,
  };

  nock('https://api.pagerduty.com').get('/incidents?limit=1').reply(200, body);

  nock('https://api.pagerduty.com')
    .get('/incidents?limit=1&offset=1')
    .reply(200, {
      ...body,
      offset: 1,
    });

  nock('https://api.pagerduty.com')
    .get('/incidents?limit=1&offset=2')
    .reply(200, {
      ...body,
      offset: 2,
      more: false,
    });

  const pd = api({token: 'someToken1234567890'});

  const resps = await pd.all({
    endpoint: '/incidents',
    data: {limit: 1},
  });

  expect(resps.length).toEqual(3);
  expect(resps[0].data.offset).toEqual(0);
  expect(resps[1].data.offset).toEqual(1);
  expect(resps[2].data.offset).toEqual(2);
  done();
});
