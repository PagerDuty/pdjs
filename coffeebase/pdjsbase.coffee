class window.PDJSobj
  @version = "0.3.1"
  
  logg: (str) ->
    if(this.logging)
      console.log(str)  
  req: () ->
    return this.req_count++

  constructor: (params = {}) ->
    this.subdomain = params.subdomain
    this.token = params.token
    this.refresh = params.refresh || 60
    this.refresh_in_ms = this.refresh * 1000
    this.protocol = params.protocol || "https"
    this.server = params.server || "pagerduty.com"
    this.logging = params.logging
    this.req_count = 1
    @api_version = "v1"
    this.logg("Initializing PDJSobj")

  # If you don't specify a callback, show something useful for debugging
  no_success_function: (json, callerparams) ->
    this.logg("no success function defined for "+ callerparams.res)
    this.logg(json)

  # If you don't override the callback on error we do the basic error handling
  error_function: (err, callerparams) ->
    this.logg("Error for "+callerparams.res)
    this.logg(err.status)
    this.logg(err.responseText)
    # PDJStools.logg(err)
    # TODO Handle these:
    # 0 Failed to connect to anything
    # 401 bad auth
    # 400 Thing not found

  api: (params = {}) ->
    this.logg("Call to API: "+ params.res)
    #PDJStools.logg(params)
    params.url = params.url || @protocol+"://"+@subdomain+"."+this.server+"/api/"+@api_version+"/"+params.res
    params.attempt = params.attempt || 0
    params.headers = params.headers || {}
    params.contentType = "application/json"
    params.data = params.data || {}
    params.data.PDJSversion = PDJSobj.version
    params.data.request_count = this.req()
    params.data.attempt = params.attempt++
    this.logg("params.data:")
    this.logg(params.data)
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
  
