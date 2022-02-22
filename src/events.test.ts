import nock = require('nock');
import {Action, ChangeParameters, Severity} from './events';
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

const changeParameters: ChangeParameters = {
  data: {
    routing_key: 'someRoutingKeybfa2a710673888f520',
    payload: {
      summary: 'Test change event',
      source: 'test-source',
      timestamp: new Date().toISOString(),
      custom_details: {
        test_detail: 'test-value',
      },
    },
  },
};

test('Events API properly passes Events V2 requests', async () => {
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
    .reply(202, body);

  const response = await event(eventPayloadV2);

  expect(response.url).toEqual('https://events.pagerduty.com/v2/enqueue');
  expect(response.data).toEqual(body);
});

test('Events API properly passes Change Events requests', async () => {
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
    .reply(202, body);

  const response = await change(changeParameters);

  expect(response.url).toEqual(
    'https://events.pagerduty.com/v2/change/enqueue'
  );
  expect(response.data).toEqual(body);
});

test('Events API properly passes Events V2 requests with images/links/details', async () => {
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
    .reply(202, body);

  const response = await event({
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

  expect(response.url).toEqual('https://events.pagerduty.com/v2/enqueue');
  expect(response.data).toEqual(body);
});

test('Events API shorthands should send corresponding events', async () => {
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
    .reply(202, body)
    .post('/v2/enqueue')
    .reply(202, body)
    .post('/v2/enqueue')
    .reply(202, body);

  let response = await acknowledge(eventPayloadV2);

  expect(response.url).toEqual('https://events.pagerduty.com/v2/enqueue');
  expect(response.data).toEqual(body);

  response = await resolve(eventPayloadV2);

  expect(response.url).toEqual('https://events.pagerduty.com/v2/enqueue');
  expect(response.data).toEqual(body);

  response = await trigger(eventPayloadV2);

  expect(response.url).toEqual('https://events.pagerduty.com/v2/enqueue');
  expect(response.data).toEqual(body);
});
