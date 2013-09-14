pdjs (base)
====

This is a simple JavaScript wrapper to the [PagerDuty API](http://developer.pagerduty.com/)

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

1. Create a PDJSobj, with a subdomain and a token/api key
2. Call an api request:
  * the *res* parameter is the URL path of the resource you want
  * the *data* parameter is optional
  * everything is asynchronous so you'll need to send a function to use on *success*
  * also optional is an *error* function



## To compile the base script:
This is written in [CoffeeScript](http://coffeescript.org/), so you're going to have to compile it to get JavaScript

coffee --output js/ --compile --watch --join pdjsbase.js coffeebase/ &