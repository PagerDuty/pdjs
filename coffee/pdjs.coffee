class PDJSobj
  @version = "0.2.1"
  @server = 'pagerduty.com'
  @protocol = "https"
  @req_count = 1
  @req: () ->
    return PDJSobj.req_count++

  constructor: (params = {}) ->
    console.log(params)
    this.subdomain = params.subdomain
    this.token = params.token
    this.refresh = params.refresh || 60
    @protocol = params.protocol || @protocol
    @server = params.server || @server
    
  set_token: (token) ->
    this.token=token
  set_subdomain: (subdomain) ->
    this.subdomain=subdomain

  # If you don't specify a callback, show something useful for debugging
  no_success_function: (json, caller) ->
    PDJStools.logg("no success function defined for "+ caller)
    PDJStools.logg(json)

  # If you don't specify a callback on error, show something useful for debugging
  no_error_function: (err, caller) ->
    PDJStools.logg("Error for "+caller)
    PDJStools.logg(err.status)
    PDJStools.logg(err.responseText)
    # PDJStools.logg(err)
    # TODO Handle these:
    # 0 Failed to connect to anything
    # 401 bad auth
    # 400 Thing not found


  api: (params = {}) ->
    PDJStools.logg("Call to API: "+ params.res)
    #PDJStools.logg(params)
    params.url = params.url || @protocol+"://"+this.subdomain+"."+@server+"/api/v1/"+params.res
    params.headers = params.headers || {}
    params.contentType = "application/json"
    params.data = params.data || {}
    params.data.PDJSversion = PDJSobj.version
    params.data.request_count = PDJSobj.req()
    console.log("params.data:")
    console.log(params.data)
    params.headers.Authorization = 'Token token='+this.token
    params.error = params.error || (err) =>
      this.no_error_function(err, params.res)
    params.success = params.success || (data) => 
      this.no_success_function(data, params.res)
    PDJStools.logg(params)
    $.ajax(params)

  # Just a shortcut method
  simple_list_api: (res, params = {}) ->
    params.res = res
    params.data = params.data || {limit: 100}
    this.api(params)

  #Return a list of incidents
  #Return a list of who's on call
  # status (default: all) one of "resolved", "triggered"
  # service_id (optional)
  # since (default: now) a Date objec
  # until (default: now) a Date object
  # sort_by: 'created_on:desc'
  get_incidents: (params = {}) ->
    this.simple_list_api("incidents", params)

  #Return a list of services
  get_services: (params = {}) ->
    this.simple_list_api("services", params)
  #Return a service
  # service_id (mandatory)
  get_service: (params = {}) ->
    params.res = "services/" + params.service_id
    this.api(params)
  #Return a list of maintenance windows
  # maintenance_windows?filter=ongoing&limit=3&sort_by=start_time&order=desc&service_ids%5B%5D=PDKO3SJ
  get_maintenance_windows: (params = {}) ->
    this.simple_list_api("maintenance_windows", params)
  
  #Return a maintenance Window  
  # maintenance_window_id (mandatory)
  #pdt-dave.pagerduty.dev/api/v1/maintenance_windows/PF9KMXH
  get_maintenance_window: (params = {}) ->
    params.res = "maintenance_windows/" + params.maintenance_window_id
    this.api(params)
    
  #Return a list of escalation policies
  get_escalation_policies: (params = {}) ->
    this.simple_list_api("escalation_policies", params)
  #Return an escalation policy
  # escalation_policy_id (mandatory)
  get_escalation_policy: (params = {}) ->
    params.res = "escalation_policies/" + params.escalation_policy_id
    this.api(params)

  #Return a list of users
  get_users: (params = {}) ->
    this.simple_list_api("users", params)
  #Return a user
  # user_id (mandatory)
  get_user: (params = {}) ->
    params.res = "users/" + params.user_id
    this.api(params)

  #Return a list of schedules
  get_schedules: (params = {}) ->
    this.simple_list_api("schedules", params)
  #Return a schedule
  # schedule_id (mandatory)
  get_schedule: (params = {}) ->
    params.res = "schedules/" + params.schedule_id
    this.api(params)

  #Return a list of who's on call
  # schedule_id (mandatory)
  # overflow (default: true)
  # since (default: now) a Date objec
  # until (default: now) a Date object
  # success: a function that 
  get_schedule_entries: (params = {}) ->
    params.res = "schedules/"+params.schedule_id+"/entries"
    params.data = params.data || {}
    params.data.overflow = params.data.overflow || "true"
    params.data.since = (params.data.since || new Date()).toISOString()
    params.data.until = (params.data.until || new Date()).toISOString()
    
    this.api(params)
  
  test: () ->
    #this.get_incidents()
    #this.get_services()
    #this.get_escalation_policies()    
    this.get_maintenance_windows()    
    #this.get_escalation_policy({escalation_policy_id:"PDECCNC"})    
    #this.get_users()
    #this.get_schedules()
    #this.get_schedules({schedule_id:"PHV31QN"})
    #this.get_schedule_entries({schedule_id:"PHV31QN"})
    #this.get_service({service_id:"PDKO3SJ"})
    #this.get_user({user_id:"PQNLEAP"})

jQuery -> 
  PDJS = new PDJSobj(pdjs_settings)
  PDJS.test()
  window.PDJS = PDJS
  #PDJS2 = new PDJSobj2 PDJS
  #PDJS2.update_schedule("PHV31QN")
  #PDJS2.update_things()
  #window.PDJS2 = PDJS2
  
