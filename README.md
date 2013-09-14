pdjs (base)
====

This is a simple JavaScript wrapper to the [PagerDuty API](http://developer.pagerduty.com/)

Include [jQuery](http://jquery.com/) and [pdjsbase.js](http://eurica.github.io/pdjs/js/pdjsbase.js)

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

## The *api_all* helper

There's also a helper method that will handle limits and offsets for lists longer than 100 elements:

    PDJS.api_all({
      res: "incidents",
      data: {
        since: "2013-08-01T09:53:17-07:00",
        until: "2013-08-14T09:53:17-07:00",
        status: "resolved",
        fields: "incident_number,status,created_on,service,last_status_change_by,last_status_change_on"
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

## To compile the base script:
This is written in [CoffeeScript](http://coffeescript.org/), so you're going to have to compile it to get JavaScript

coffee --output js/ --compile --watch --join pdjsbase.js coffeebase/ &
