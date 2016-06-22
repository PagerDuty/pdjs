class window.PDJSobj
  @version = "PDJS-1.0.0"
  logg: (str) ->
    if(this.logging)
      console.log(str)
  req: () ->
    return this.req_count++

  constructor: (params = {}) ->
    this.async = params.async == false ? false : true;
    this.token = params.token
    this.refresh = params.refresh || 60
    this.refresh_in_ms = this.refresh * 1000
    this.protocol = params.protocol || "https"
    this.server = params.server || "pagerduty.com"
    this.logging = params.logging || false
    this.req_count = 1
    this.logg("Initializing PDJSobj")

  # If you don't specify a callback, show something useful for debugging
  no_success_function: (json, callerparams) ->
    this.logg("no success function defined for "+ callerparams.res)
    this.logg(json)

  # If you don't override the callback on error we do the basic error handling
  error_function: (err, callerparams) ->
    console.log("Error for "+callerparams.res)
    console.log(err.status)
    error_detail = err.responseText
    try
      error_detail = JSON.parse(error_detail)
    catch anyerror
      this.logg("Not an JSON error")
    console.log(error_detail)
    # PDJStools.logg(err)
    # TODO Handle these:
    # 0 Failed to connect to anything
    # 401 bad auth
    # 400 Thing not found

  api: (params = {}) ->
    this.logg("Call to API: "+ params.res)
    #PDJStools.logg(params)
    params.url = params.url || @protocol+"://api."+this.server+"/"+params.res
    params.attempt = params.attempt || 0
    params.async = params.async || this.async # For batch jobs, async helps us avoid getting throttled
    params.headers = params.headers || {}
    params.contentType = "application/json; charset=utf-8"
    params.dataType = "json"
    params.accepts = { json: 'application/vnd.pagerduty+json;version=2' }
    params.data = params.data || {}
    params.data.PDJSversion = PDJSobj.version
    params.data.request_count = this.req()
    params.data.attempt = params.attempt++
    this.logg("params.data:")
    this.logg(params.data)
    params.type = (params.type||"GET").toUpperCase()
    if(params.type=="POST" || params.type=="PUT") # the update APIs expect the data in the body to be JSON
      params.data = JSON.stringify(params.data)
    params.headers.Authorization = 'Token token='+this.token
    params.error = params.error || (err) =>
      this.error_function(err, params)
    params.success = params.success || (data) =>
      this.no_success_function(data, params)
    this.logg(params)
    $.ajax(params)

  # For list queries, this will recursively keep getting the next offset
  api_all: (params = {}, datasofar=[]) ->
    params.data = params.data || {}
    params.data.limit = 100
    params.data.offset = params.data.offset || 0
    params.final_success = params.final_success || (data) =>
      this.no_success_function(data, params)
    params.incremental_success = params.incremental_success || (data) =>
      0
    params.success = (data) =>
      data.res = params.res
      params.incremental_success(data[params.res])
      datasofar = datasofar.concat(data[params.res])
      window.datasofar = datasofar
      window.d = data
      if(data.total > data.limit+data.offset)
        this.logg("Getting more")
        params.data.offset+=params.data.limit
        this.api_all(params, datasofar)
      else
        this.logg("All done")
        this.logg(params)
        data[params.res] = datasofar
        data.res = params.res
        data.offset = 0
        data.limit = data.total
        this.logg(data)
        params.final_success(data)

    this.logg(params)
    this.api(params)

  # the event API is different enough to have its own function
  event: (params = {}) ->
    this.logg("Create an event")
    params.type = "POST"
    params.url = params.url || @protocol+"://events."+this.server+"/generic/2010-04-15/create_event.json"

    params.data = params.data || {}
    params.data.service_key = params.data.service_key || params.service_key || this.logg("No service key")
    params.data.event_type = params.data.event_type || params.event_type || "trigger"
    params.data.incident_key = params.data.incident_key || params.incident_key || "Please specify an incident_key"
    params.data.client = params.data.client || params.client if params.client
    params.data.client_url = params.data.client_url || params.client_url if params.client_url
    params.data.description = params.data.description || params.description || "No description provided"
    params.data.details = params.data.details || params.details || {}
    params.data.contexts = params.data.contexts || params.contexts || {}
    params.data = JSON.stringify(params.data)

    params.contentType =  "application/json; charset=utf-8"
    params.dataType = "json"
    params.error = params.error || (err) =>
      this.error_function(err, params)
    params.success = params.success || (data) =>
      this.no_success_function(data, params)
    $.ajax(params)

  # Shortcut methods
  trigger: (params = {}) ->
    params.event_type = "trigger"
    this.event(params)
  # Todo: add some examples to the docs
  acknowledge: (params = {}) ->
    params.event_type = "acknowledge"
    this.event(params)
  resolve: (params = {}) ->
    params.event_type = "resolve"
    this.event(params)
