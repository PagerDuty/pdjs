# README

A simple JavaScript wrapper for the PagerDuty APIs.

 - Supports Node and Browser environments
 - Supports REST, Events v1, Events v2 APIs.
 - Supports both offset and cursor based pagination

## Installation

**Note:** Proper NPM support still TODO.

For the time being:

```bash
npm install --save dobs/pdjs-next#main
```

## Usage

### REST API

REST API calls can be done using the convenience methods or by passing in a `url` or `endpoint`.

#### convenience Methods

```javascript
import {api} from 'pdjs-next';

const pd = api({token: 'someToken1234567890'})

pd.get('/incidents')
  .then({data, resource, next} => console.log(data, resource, next))
  .catch(console.error);

// Similarly, for `post`, `put`, `patch` and `delete`.
pd.post('/incidents', { data: { ... } }).then(...)
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

There's an async `all` that attempts to fetch all pages for a given endpoint and set of parameters. For convenience this function supports both offset and cursor based pagination.

Note that the PagerDuty API has a limit of 10,000 for most endpoints and recommends using parameters to refine searches where more results are necessary. More information can be found in the [Developer Documentation.](https://developer.pagerduty.com/docs/rest-api-v2/pagination/)

```javascript
import {all} from 'pdjs-next';

// List every API-accessible incident.
const responses = await all({
  token: 'someToken1234567890',
  endpoint: '/incidents',
  limit: 5000,
});

for (response of responses) {
  console.log(response.data);
}
```

### Events API

Both V1 and V2 of the Events API are supported, with the version to used being based on the payload. For example, the Events API V2:

```javascript
import {event} from 'pdjs-next';

event({
  data: {
    routing_key: '791695b5cdea40bfa2a710673888f520',
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

### Browser

Two browser-ready scripts are provided:

- [dist/pdjs.js](https://raw.githubusercontent.com/dobs/pdjs-next/main/dist/pdjs.js): For browsers supporting `fetch`.
- [dist/pdjs-legacy.js](https://raw.githubusercontent.com/dobs/pdjs-next/main/dist/pdjs-legacy.js): For older browsers requiring a `fetch` polyfill -- mostly IE 11.

Either of these files can be used by copying them into your project and including them directly, with all functions namespaced `PagerDuty`:

```html
<script src="pdjs.js"></script>
<script>
  PagerDuty.api({token: 'someToken1234567890', res: '/incidents'})
    .then(response => console.log(response.data))
    .catch(console.error);
</script>
```
