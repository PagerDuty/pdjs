PDJS (PagerDuty base JavaScript API)
====

This is a simple JavaScript wrapper to the [PagerDuty API](https://v2.developer.pagerduty.com/v2/docs)

## Making an API request

1. Create a PDJSobj, with a subdomain and a token/api key

Include [jQuery](http://jquery.com/) and [pdjs.js](http://eurica.github.io/pdjs/js/pdjs.js)

    PDJS = new PDJSobj({
      token: "****************VDzA",
    })
    
  This configuration uses version 2 of the PagerDuty REST and Events API as default. To request version 1, the api version needs to be specified on instantiation of the PDJSObj. The **api_version** parameter is optional.
  

    PDJS = new PDJSobj({
      subdomain: 'webdemo',
      token: 'rcgtBVpizBZQjDzE3Hub',
      api_version: 'v1'
    })
    
2. Call an api request:
  * the **res** parameter is the URL path of the resource you want
  * the **data** parameter is optional

   `` PDJS.api({
      res: 'services',
      data: {
        limit: 20,
      },
      success: function (data) {
        console.log(data)
      },
    })``

## Making an API request

1. Create a PDJSobj, with a token/api key
2. Call an api request:
  * the **res** parameter is the URL path of the resource you want
  * the **data** parameter is optional

3. Everything is asynchronous so you'll need:
  * a *function* to use on **success**i
  * also optional is an **error** function

The **res** parameter may have an ID in it, here's the call to get the [notes](https://v2.developer.pagerduty.com/v2/page/api-reference#!/Incidents/get_incidents_id_notes) for incident PNCII2E

    PDJS.api({
      res: 'incidents/PNCII2E/notes',
      success: function (data) {
        alert(JSON.stringify(data))
      },
    })

POST and PUT requests are supported as well (although I can't give you any live examples, since the API key from webdemo is read-only, so go ahead and [generate an API key](http://support.pagerduty.com/entries/23761081-Generating-an-API-Key) from your own account)

For instance, here I'm adding a contact method for a user: test@example.com, and then adding a notification rule to alert that email address after 900 minutes:

    add_contact_method = function(user_id) {
      PDJS.api({
        res: 'users/'+user_id+'/contact_methods',
        type: 'POST',
        data: {
          contact_method: {
            type:'email',
            address:'test4@example.com',
            label: 'Added from PDJS',
          }
        },
        success: function (data) {
          console.log('New contact method ID: ' + data.contact_method.id)
          add_notification_rule(user_id, data.contact_method.id, 900)
        }
      })
    }

    add_notification_rule = function(user_id, contact_method, start_delay_in_minutes) {
      PDJS.api({
        res: 'users/'+user_id+'/notification_rules',
        type: 'POST',
        data: {
          notification_rule: {
            contact_method_id: contact_method,
            start_delay_in_minutes: start_delay_in_minutes,
          }
        },
        success: function (data) {
          console.log(data)
          console.log('New notification rule ID: ' + data.notification_rule.id)
        }
      })
    }

    add_contact_method('PRJRF7T')

## Triggering an incident (V2)

With Events API V2, alerts can be grouped with the same dedup_key.

PDJS.trigger({
  routing_key: '<v2 integration key>',
  event_action: 'trigger',
  data: {
    summary: 'Server on Fire',
    source: 'pdjs',
    severity: 'info'
    }
  })

## Triggering an incident (V2)

The [integration API](http://developer.pagerduty.com/documentation/integration/events) has its own function as well

    PDJS.trigger({
      service_key: '5eb2b9dae1b2480abf59f58c78ba06e7',
      description: 'Server on Fire',
      incident_key: (new Date()).toString(),
      details: {
        cause: 'PEBKAC'
      }
    })

Again, you can specify a **success** function that will get a JavaScript object representing the incident:

    {
      status: 'success',
      message: 'Event processed',
      incident_key: '8a803874eda340a09928f2631a39378d'
    }

## The *api_all* helper

There's also a helper method that will handle limits and offsets for lists longer than 100 elements:

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

It works the same, except you'll need to specify one or more of:

  * a *function* to run on **final_success** at the end
  * a *function* to run on each **incremental_success**

That's kind of nifty.

## Examples

There's an examples directory:

  * [examples/incidents.html](https://pagerduty.github.io/pdjs/examples/incidents.html) polls the [incidents](http://developer.pagerduty.com/documentation/rest/incidents/list) api and displays the triggered & acknowledged incidents
  * [examples/report.html](https://pagerduty.github.io/pdjs/examples/report.html) shows off *api_all* by looping through all the events on my webdemo account for the last 30 days and prints them out as a CSV-esque thing that you could paste into a CSV file.
  * [examples/trigger.html](https://pagerduty.github.io/pdjs/examples/trigger.html) shows how to trigger an incident
  * Some of our [addon examples](https://github.com/PagerDuty/addons/) use it

## To compile the base script:
This is written in [CoffeeScript](http://coffeescript.org/), so you're going to have to compile it to get JavaScript

coffee --output js/ --compile --watch --join pdjs.js coffee/ &

## More info

Are you using this?  Let us know! @pagerduty or add it to our addons repo: https://github.com/PagerDuty/addons/

You might notice that PDJS sends along some extra parameters, nothing scary, we use those to track QoS across our language-specific libraries.

Possibly also of interest is [node-pagerduty](https://github.com/Skomski/node-pagerduty) to trigger PagerDuty incidents from node.js.
