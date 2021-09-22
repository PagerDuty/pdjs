"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const nock = require("nock");
const index_1 = require("./index");
const eventPayloadV2 = {
    data: {
        routing_key: 'someRoutingKeybfa2a710673888f520',
        event_action: 'trigger',
        dedup_key: 'test_incident_2_88f520',
        payload: {
            summary: 'Test Event V2',
            source: 'test-source',
            severity: 'error',
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
    const response = await (0, index_1.event)(eventPayloadV2);
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
    const response = await (0, index_1.change)(eventPayloadV2);
    expect(response.url).toEqual('https://events.pagerduty.com/v2/change/enqueue');
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
    const response = await (0, index_1.event)({
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
    let response = await (0, index_1.acknowledge)(eventPayloadV2);
    expect(response.url).toEqual('https://events.pagerduty.com/v2/enqueue');
    expect(response.data).toEqual(body);
    response = await (0, index_1.resolve)(eventPayloadV2);
    expect(response.url).toEqual('https://events.pagerduty.com/v2/enqueue');
    expect(response.data).toEqual(body);
    response = await (0, index_1.trigger)(eventPayloadV2);
    expect(response.url).toEqual('https://events.pagerduty.com/v2/enqueue');
    expect(response.data).toEqual(body);
});
//# sourceMappingURL=events.test.js.map