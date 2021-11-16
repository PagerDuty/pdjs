# README

A simple JavaScript wrapper for the PagerDuty APIs.

 - Supports Node and Browser environments
 - Supports REST and Events v2 APIs.
 - Supports both offset and cursor based pagination

For full [API Reference see this page.](https://developer.pagerduty.com/api-reference)

## Installation

```bash
npm install --save @pagerduty/pdjs
```

## Usage

### REST API

REST API calls can be done using the convenience methods or by passing in a `url` or `endpoint`.

#### Convenience Methods

There are some simple convience methods. `get()`, `post()`, `put()`, and `delete()`.

```javascript
import {api} from '@pagerduty/pdjs';

const pd = api({token: 'someToken1234567890'});

pd.get('/incidents')
  .then({data, resource, next} => console.log(data, resource, next))
  .catch(console.error);

// Similarly, for `post`, `put`, `patch` and `delete`.
pd.post('/incidents', { data: { ... } }).then(...)
```
#### `tokenType`
Allows you to set either `token` or `bearer` tokens. Defaults to `token` but provides ability to use `bearer` as well.
- [Tokens](https://developer.pagerduty.com/docs/rest-api-v2/authentication/) are generated in your PagerDuty account.
- **Bearer** tokens are generated through an [OAuth 2.0](https://developer.pagerduty.com/docs/app-integration-development/oauth-2-functionality/) authorization flow. For example, to use a Bearer token when initializing `api` you'll pass int the `tokenType` parameter, like so:

```javascript
const pd = api({token: 'someBearerToken1234567890', tokenType: 'bearer'});
```

#### `url` or `endpoint`

```javascript
// Calling the returned function with a `endpoint` or `url` will also send it.
pd({
  method: 'post',
  endpoint: '/incidents',
  data: {
    ...
  }
}).then(...)
```

#### The Response Object

The PD object always returns an APIResponse object which contains some raw data as well as a convenient shortcut to directly access the returns Resource.

```javascript

pd.get('/incidents')
  .then({resource, data, response, next} => {
    console.log(resource); // Contains the data of resource request. In this example the 'incidents' data.
    console.log(data);     // The raw data returned from the API, also contains pagination information.
    console.log(response); // The response object returned from the cross-fetch
    console.log(next);     // A convenience function to help with pagination
  })
  .catch(console.error);

```

#### Pagination

There's an convience method `all` that attempts to fetch all pages for a given endpoint and set of parameters. For convenience this function supports both offset and cursor based pagination.

Note that the PagerDuty API has a limit for most endpoints and recommends using parameters to refine searches where more results are necessary. More information can be found in the [Developer Documentation.](https://developer.pagerduty.com/docs/rest-api-v2/pagination/)

The response object of an API call also contains a `nextFunc` which can be used to define your own Pagination function if you feel included.

```javascript
import {api} from '@pagerduty/pdjs';

const pd = api({token: 'someToken1234567890'});

pd.all('/incidents')
  .then({data, resource} => console.log(data, resource))
  .catch(console.error);
```

#### Options

The API interface allows for some extra parameters to be included.

##### `server`
To use this library with a different service region use this parameter to change the root url of requests. Default: `api.pagerduty.com`. 

```javascript
pd({
  method: 'post',
  endpoint: '/incidents',
  server: 'api.eu.pagerduty.com',
  data: {
    ...
  }
}).then(...)
```

##### `headers`
Some endpoints require the setting of extra `headers` such as a `From` header.

```javascript
pd({
  method: 'post',
  endpoint: '/incidents',
  headers: {
    'From': "me@example.com"
  },
  data: {
    ...
  }
}).then(...)
```

### Retries

There is some very simple retry logic baked into each request in the case that the PagerDuty API rate limits your requests (only when it responds HTTP Code 429). Requests will retry 3 times waiting 20 seconds between each request. If the request is still being rate limited after 3 attempts the client will simply return the 429 response.

### Events API

Events V2 is supported along with Change Events.

```javascript
import {event} from '@pagerduty/pdjs';
event({
  data: {
    routing_key: 'YOUR_ROUTING_KEY',
    event_action: 'trigger',
    dedup_key: 'test_incident_2_88f520',
    payload: {
      summary: 'Test Event V2',
      source: 'test-source',
      severity: 'error',
    },
  },
})
  .then(console.log)
  .catch(console.error);
```

#### Convenience Methods

```javascript
import {change, trigger, acknowledge, resolve} from '@pagerduty/pdjs';

change({
    "routing_key": "YOUR_ROUTING_KEY",
    "payload": {
      "summary": "Build Success:!",
      "timestamp": "2015-07-17T08:42:58.315+0000",
      "source": "prod-build-agent",
      "custom_details": {
        "build_state": "passed",
        "build_number": "220",
        "run_time": "1337s"
      }
    },
    "links": [{
      "href": "https://buildpipeline.com",
      "text": "View in Build Pipeline"
    }]
})
  .then(console.log)
  .catch(console.error);

trigger({...})
  .then(console.log)
  .catch(console.error);
acknowledge({...})
  .then(console.log)
  .catch(console.error);
resolve({...})
  .then(console.log)
  .catch(console.error);
```

### Browser

Two browser-ready scripts are provided:

- [dist/pdjs.js](https://raw.githubusercontent.com/PagerDuty/pdjs/main/dist/pdjs.js): For browsers supporting `fetch`.
- [dist/pdjs-legacy.js](https://raw.githubusercontent.com/PagerDuty/pdjs/main/dist/pdjs-legacy.js): For older browsers requiring a `fetch` polyfill -- mostly IE 11.

Either of these files can be used by copying them into your project and including them directly, with all functions namespaced `PagerDuty`:

```html
<script src="https://raw.githubusercontent.com/PagerDuty/pdjs/main/dist/pdjs.js"></script>
<script>
  PagerDuty.api({token: 'someToken1234567890', endpoint: '/incidents'})
    .then(response => console.log(response.data))
    .catch(console.error);
</script>
```
