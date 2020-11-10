import nock = require('nock');
import {Action, Severity} from './events';
import {event, change, trigger, resolve, acknowledge} from './index';

const eventPayloadV2 = {
  data: {
    routing_key: 'someRoutingKeybfa2a710673888f520',
    event_action: <Action>'trigger',
    dedup_key: 'test_incident_2_88f520',
    payload: {
      summary: 'Test Event V2',
      source: 'test-source',
      severity: <Severity>'error',
    },
  },
};

test('Events API properly passes Events V2 requests', async done => {
  const body = {
    data: {
      status: 'success',
      message: 'Event processed',
      dedup_key: 'test_incident_2_88f520',
    },
  };

  nock('https://events.pagerduty.com', {
    reqheaders: {
      'User-Agent': header => header.startsWith('pdjs'),
    },
  })
    .post('/v2/enqueue')
    .reply(200, body);

  const resp = await event(eventPayloadV2);

  expect(resp.url).toEqual('https://events.pagerduty.com/v2/enqueue');
  expect(resp.data).toEqual(body);
  done();
});


test('Events API properly passes Change Events requests', async done => {
  const body = {
    data: {
      status: 'success',
      message: 'Event processed',
      dedup_key: 'test_incident_2_88f520',
    },
  };

  nock('https://events.pagerduty.com', {
    reqheaders: {
      'User-Agent': header => header.startsWith('pdjs'),
    },
  })
    .post('/v2/change/enqueue')
    .reply(200, body);

  const resp = await change(eventPayloadV2);

  expect(resp.url).toEqual('https://events.pagerduty.com/v2/change/enqueue');
  expect(resp.data).toEqual(body);
  done();
});

test('Events API properly passes Events V2 requests with images/links/details', async done => {
  const body = {
    data: {
      status: 'success',
      message: 'Event processed',
      dedup_key: 'test_incident_2_88f520',
    },
  };

  nock('https://events.pagerduty.com', {
    reqheaders: {
      'User-Agent': header => header.startsWith('pdjs'),
    },
  })
    .post('/v2/enqueue')
    .reply(200, body);

  const resp = await event({
    data: {
      routing_key: 'someRoutingKeybfa2a710673888f520',
      event_action: 'trigger',
      dedup_key: 'test_incident_3_88f520',
      payload: {
        summary: 'Test Event V2',
        source: 'test-source',
        severity: 'error',
        custom_details: {
          foo: 'bar',
        },
      },
      images: [
        {
          src: 'foo.jpg',
        },
      ],
      links: [
        {
          href: 'https://www.pagerduty.com',
        },
      ],
    },
  });

  expect(resp.url).toEqual('https://events.pagerduty.com/v2/enqueue');
  expect(resp.data).toEqual(body);
  done();
});

test('Events API shorthands should send corresponding events', async done => {
  const body = {
    data: {
      status: 'success',
      message: 'Event processed',
      dedup_key: 'test_incident_2_88f520',
    },
  };

  nock('https://events.pagerduty.com', {
    reqheaders: {
      'User-Agent': header => header.startsWith('pdjs'),
    },
  })
    .post('/v2/enqueue')
    .reply(200, body);

  const resp = await acknowledge(eventPayloadV2);

  expect(resp.url).toEqual('https://events.pagerduty.com/v2/enqueue');
  expect(resp.data).toEqual(body);
  done();
});
