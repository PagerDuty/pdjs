PDJS (PagerDuty base JavaScript API)
====

This is a simple JavaScript wrapper to the [PagerDuty API](http://developer.pagerduty.com/)

Include [jQuery](http://jquery.com/) and [pdjs.js](http://eurica.github.io/pdjs/js/pdjs.js)

    PDJS = new PDJSobj({
      subdomain: "webdemo",
      token: "CkNpsqH9i6yTGus8VDzA",
    })

    PDJS.api({
      res: "services",
      data: {
        limit: 20,
      },
      success: function (json) {
        console.log(JSON.stringify(json))
      },
    })

## Making an API request

1. Create a PDJSobj, with a subdomain and a token/api key
2. Call an api request:
  * the **res** parameter is the URL path of the resource you want
  * the **data** parameter is optional
3. Everything is asynchronous so you'll need:
  * a *function* to use on **success**
  * also optional is an **error** function

The **res** parameter may have an ID in it, here's the call to get the [notes](http://developer.pagerduty.com/documentation/rest/incidents/notes/list) for incident PNCII2E

    PDJS.api({
      res: "incidents/PNCII2E/notes",
      success: function (json) {
        alert(JSON.stringify(json))
      },
    })

POST and PUT requests are supported as well (although I can't give you any live examples, since the API key from webdemo is read-only, so go ahead and [generate an API key](http://support.pagerduty.com/entries/23761081-Generating-an-API-Key) from your own account)

For instance, here I'm adding a contact method for a user: test@example.com, and then adding a notification rule to allert that email address after 900 minutes:

    add_contact_method = function(user_id) {
      PDJS.api({
        res: "users/"+user_id+"/contact_methods",
        type: "POST",
        data: {
          contact_method: {
            type:"email",
            address:"test4@example.com",
            label: "Added from PDJS",
            }
        },
        success: function (json) {
          console.log("New contact method ID: " + json.contact_method.id)
          add_notification_rule(user_id, json.contact_method.id, 900)
        }
      })
    }

    add_notification_rule = function(user_id, contact_method, start_delay_in_minutes) {
      PDJS.api({
        res: "users/"+user_id+"/notification_rules",
        type: "POST",
        data: {
          notification_rule: {
            contact_method_id: contact_method,
            start_delay_in_minutes: start_delay_in_minutes,
            }
        },
        success: function (json) {
          console.log(json)
          console.log("New notification rule ID: " + json.notification_rule.id)
        }
      })
    }

    add_contact_method("PRJRF7T")

## Triggering an incident

The [integration API](http://developer.pagerduty.com/documentation/integration/events) has its own function as well

    PDJS.trigger({
      service_key: "5eb2b9dae1b2480abf59f58c78ba06e7",
      description: "Server on Fire",
      incident_key: (new Date()).toString(),
      details: {
        cause: "PEBKAC"
      }
    })
    
Again, you can specify a **success** function that will get JSON representing the incident: 

    {
      "status":"success",
      "message":"Event processed",
      "incident_key":"8a803874eda340a09928f2631a39378d"
    }

## The *api_all* helper

There's also a helper method that will handle limits and offsets for lists longer than 100 elements:

    PDJS.api_all({
      res: "incidents",
      data: {
        since: "2013-08-01T09:53:17-07:00",
        until: "2013-08-14T09:53:17-07:00",
        status: "resolved",
        fields: "incident_number,status,created_on,service"
      },
      final_success: function(data) {
        console.log(data.total + " objects!");
        console.log(data);
      },
      incremental_success: function(data) {
        console.log("Got data");
      }
    })

It works the same, except you'll need to specify one or more of:

  * a *function* to run on **final_success** at the end
  * a *function* to run on each **incremental_success**

That's kind of nifty.

## Examples

There's an examples directory:

  * [examples/incidents.html](http://eurica.github.io/pdjs/examples/incidents.html) polls the [incidents](http://developer.pagerduty.com/documentation/rest/incidents/list) api and displays the triggered & acknowledged incidents
  * [examples/report.html](http://eurica.github.io/pdjs/examples/report.html) shows off *api_all* by looping through all the events on my webdemo account for the last 30 days and prints them out as a CSV-esque thing that you could paste into a CSV file.
  * [examples/trigger.html](http://eurica.github.io/pdjs/examples/trigger.html) shows how to trigger an incident

## To compile the base script:
This is written in [CoffeeScript](http://coffeescript.org/), so you're going to have to compile it to get JavaScript

coffee --output js/ --compile --watch --join pdjs.js coffee/ &

## More info

Are you using this?  Let me know: [dave@euri.ca](mailto:dave@euri.ca).  

You might notice that PDJS sends along some extra parameters, even though this is currently a side project of mine, I work for [PagerDuty](http://www.pagerduty.com) and I want to track QoS across our language-specific libraries.

Coming soon:

  * The ability to trigger incidents on Generic API services.
  * [Error](http://developer.pagerduty.com/documentation/rest/errors) handling and throttling
  * More examples

Possibly also of interest is [node-pagerduty](https://github.com/Skomski/node-pagerduty) to trigger PagerDuty incidents from node.js.