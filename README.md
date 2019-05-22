PDJS (PagerDuty based JavaScript API)
====
This is a simple client-side JavaScript wrapper to the [PagerDuty API](https://v2.developer.pagerduty.com/v2/docs).

## Making an API request
### Setup PDJSobj
1. First, you'll need the following dependencies included in your project to utilize PDJS.
    * [pdjs.js](https://github.com/PagerDuty/pdjs) -- you can download it and manually add it to your project. Or, `npm i pagerduty-pdjs`.
1. Create a `PDJSobj` object, setting values for the `subdomain`, `token`, and `api_version` fields on the object.
```javascript
var PDJS = new PDJSobj({
  subdomain: 'webdemo',
  token: 'rcgtBVpizBZQjDzE3Hub',    
  api_version: 'v1',
  logging: true
});
```

  * `subdomain` -- for this example we're using the `webdemo`, but you would want to put in your subdomain.
  * `token` -- your [API token](https://support.pagerduty.com/docs/using-the-api#section-generating-a-general-access-rest-api-key). The one above is to provide read-only access to the `webdemo` account. You can decide what kind of access your token will provide when you create it.
  * `api_version` -- By default, `PDJS` uses version 2 of the PagerDuty REST and Events API. To request version 1, the api version needs to be specified here. The **api_version** parameter is optional.
    
### Call API:
The most basic way to make an API call with `PDJS` is to use the `PDJS.api()` function.
```javascript
PDJS.api({
  res: 'services',
  data: {
    limit: 20,
  },
  success: function (data) {
    console.log(data)
  },
})
```
  * `res` -- the API endpoint and path you're calling*
  * `data` -- the query-string parameters that can be appended to the endpoint. This parameter is optional.
  * `success` -- the callback function that is called when the API call completes successfully. This is **required**.
  * `error` -- the callback function that is called when there is an error with the API call. This parameter is optional, though recommended.

*In additino to specififying the endpoint, the `res` parameter may have an ID in it. For example, here's how to get the [notes](https://v2.developer.pagerduty.com/v2/page/api-reference#!/Incidents/get_incidents_id_notes) for an `incident` with the ID of `PNCII2E`.

```javascript
PDJS.api({
  res: 'incidents/PNCII2E/notes',
  success: function (data) {
    alert(JSON.stringify(data))
  },
})
```
### PUT and POST
`POST` and `PUT` requests are also supported.

For instance, the following snippet adds a `contact_method` for `user: test@example.com`, and then adding a notification rule to alert that email address after 900 minutes:

```javascript
add_contact_method = function(user_id) {
  PDJS.api({
    res: `users/${user_id}/contact_methods`,
    type: 'POST',
    data: {
      contact_method: {
        type:'email_contact_method',
        address:'test4@example.com',
        label: 'Added from PDJS',
      }
    },
    success: function (data) {
      console.log('New contact method ID: ' + data.contact_method.id)
      add_notification_rule(user_id, data.contact_method, 900)
    }
  })
}

add_notification_rule = function(user_id, contact_method, start_delay_in_minutes) {
  PDJS.api({
    res: `users/${user_id}/notification_rules`,
    type: 'POST',
    data: {
      notification_rule: {
          type: "assignment_notification_rule",
          contact_method: contact_method,
          start_delay_in_minutes: start_delay_in_minutes,
          urgency: "high"
      }
    },
    success: function (data) {
      console.log(data)
      console.log('New notification rule ID: ' + data.notification_rule.id)
    }
  })
}

add_contact_method('PRJRF7T');
```
To see this code in action go to the [add_contact_method example](examples/add_contact_method.html).

## The *api_all* helper

In addition to `PDJS.api()` there's also `PDJS.api_all()` which is a helper method that will handle limits and offsets for lists longer than 100 elements:
```javascript
PDJS.api_all({
  res: 'incidents',
  data: {
    since: '2013-08-01T09:53:17-07:00',
    until: '2013-08-14T09:53:17-07:00',
    status: 'resolved',
    fields: 'incident_number,status,created_on,service'
  },
  final_success: function(data) {
    console.log(data.total + ' objects!');
    console.log(data);
  },
  incremental_success: function(data) {
    console.log('Got data');
  }
})
```
It works the same as `PDJS.api()`, except you'll need to specify one or more of:

  * a *function* to run on **final_success** at the end
  * a *function* to run on each **incremental_success**

That's kind of nifty.

## Examples

To get an idea for how `PDJS` works, there's an examples directory:

  * [examples/incidents.html](https://pagerduty.github.io/pdjs/examples/incidents.html) polls the [incidents](http://developer.pagerduty.com/documentation/rest/incidents/list) api and displays the triggered & acknowledged incidents
  * [examples/report.html](https://pagerduty.github.io/pdjs/examples/report.html) shows off *api_all* by looping through all the events on my webdemo account for the last 30 days and prints them out as a CSV-esque thing that you could paste into a CSV file

## Compiling the Base Script:
`PDJS` is written in [CoffeeScript](http://coffeescript.org/). To make changes to the library, you'll edit the `coffee/pdjsbase.coffee` file and compile it by running the command below from the `pdjs` directory to produce the JavaScript.

`coffee --output js/pdjs.js --compile --watch coffee/ `

## More info
This project is for client-side JavaScript. If you're looking for a Node library, we recommend the [node-pagerduty](https://github.com/kmart2234/node-pagerduty) library.

Are you using this library or have questions?  Let us know by posting to the [PagerDuty Community Developer Forum](https://community.pagerduty.com/c/dev).

You might notice that PDJS sends along some extra parameters, nothing scary, we use those to track QoS across our language-specific libraries.
