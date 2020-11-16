import nock = require('nock');
import {api} from './index';

test('API request should return after 3 rate limited requests', async done => {
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

  const response = await api({
    token: 'someToken1234567890',
    endpoint: '/incidents',
    retryTimeout: 20,
  });

  expect(response.response.status).toEqual(429);
  done();
});

test('API should return data after getting rate limited once.', async done => {
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

  const response = await api({
    token: 'someToken1234567890',
    endpoint: '/incidents',
    retryTimeout: 20,
  });

  expect(response.response.status).toEqual(200);
  expect(response.data).toEqual(body);
  done();
});
