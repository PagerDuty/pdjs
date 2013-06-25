class window.PDJSobj
  @version = 0.2
  @server = 'pagerduty.dev'
  @protocol = "http"
  @req_count = 1
  @req: () ->
    return PDJSobj.req_count++
  set_token: (token) ->
    this.token=token
  set_subdomain: (subdomain) ->
    this.subdomain=subdomain
  update_service_incidents: (service_id) -> 
    until_date = (new Date())
    since_date = ( new Date(until_date.getTime() - 90*PDJStools.SECONDS_IN_A_DAY) )
    params = 
      url: "https://"+this.subdomain+".pagerduty.com/api/v1/incidents"
      type: "GET"
      headers: 
        Authorization: 'Token token='+this.token
      data:
        status: "resolved"
        service: service_id
        sort_by: 'created_on:desc'
        "since": since_date.toISOString()
        "until": until_date.toISOString()
      success: (json) -> 
        PDJStools.logg(json)
        heroes = {}
        total_time = 0
        worst_time = 0
        best_time = PDJStools.SECONDS_IN_A_DAY*365
        max = 0
        leader = 'no-one'
        for i in json.incidents
          t = ( new Date(i.last_status_change_on) - new Date(i.created_on) )
          worst_time = Math.max(worst_time, t)
          best_time = Math.min(best_time, t)
          total_time += t
          heroes[i.last_status_change_by.name] = (heroes[i.last_status_change_by.name]||0)+1
          if(heroes[i.last_status_change_by.name]>max)
            max = heroes[i.last_status_change_by.name]
            leader = i.last_status_change_by.name
        results = 
          best_time: PDJStools.timeAsWords(best_time)
          worst_time: PDJStools.timeAsWords(worst_time)
          total_time: PDJStools.timeAsWords(total_time)
          average_time: PDJStools.timeAsWords(total_time/json.incidents.length)
          uptime: (new String((1 - ( total_time/ (PDJStools.SECONDS_IN_A_DAY*90) ))*100)).substr(0,5)
          leader: leader
          leader_resolves: max
          heroes: heroes
        $("#"+service_id+".pdjs_service_incidents").html("The average incident takes "+results.average_time+" ( "+results.best_time+" - "+results.worst_time+" ) "+results.leader+" has resolved "+results.leader_resolves+ " incidents")
        results
    PDJStools.logg(params)
    $.ajax(params)

  open_service: (me) ->
    window.open("https://"+this.subdomain+".pagerduty.com/services/"+me.id)
  update_service: (service_id) ->
    PDJStools.logg("update_service: "+service_id + " at "+this.subdomain)
    this.api
      res: "services/"+service_id,
      success: (json) =>
        status = "resolved"
        if(json.service.incident_counts.acknowledged) 
          status="acknowledged"
        if(json.service.incident_counts.triggered) 
          status="triggered"
        if(json.service.status=="disabled") 
          status="disabled"
        if(this.services[service_id] != status)
          desc = "Service: \""+json.service.name+"\" was "+status+" as of "+PDJStools.timeUntil(json.service.last_incident_timestamp);
          $("#"+service_id+".pdjs_service").removeClass("pdjs_triggered").removeClass("pdjs_acknowledged").removeClass("pdjs_resolved").removeClass("pdjs_disabled")
          $("#"+service_id+".pdjs_service").attr("title", desc).addClass("pdjs_"+status)
          this.services[service_id] = status

  update_schedule: (schedule_id) ->
    PDJStools.logg("update_schedule: "+schedule_id)
    this.api
      res: "schedules/"+schedule_id+"/entries"
      data: 
        "overflow" : "true"
        "since":(new Date()).toISOString()
        "until":(new Date()).toISOString()
      success: (json) ->
        PDJStools.logg(json)
        on_call = json.entries[0]
        end = new Date(on_call.end)
        status = "<a href=\"https://pdt-dave.pagerduty.com/users/"+on_call.user.id+"\" target=\"_blank\">"+on_call.user.name+"</a> is on call for another "+PDJStools.timeUntil(end)
        $("#"+schedule_id+".pdjs_schedule").html(status)

  api: (params) ->
    PDJStools.logg("Call to API: ")
    PDJStools.logg(this)
    PDJStools.logg(params)
    params.url = params.url || PDJSobj.protocol+"://"+this.subdomain+"."+PDJSobj.server+"/api/v1/"+params.res
    params.headers = params.headers || []
    params.contentType = "application/json"
    params.data = params.data || []
    params.data.PDJSversion = PDJSobj.version
    params.data.request_count = PDJSobj.req()
    params.headers.Authorization = 'Token token='+this.token
    params.error = (err) ->
      PDJStools.logg("Error")
      PDJStools.logg(err.status)
      PDJStools.logg(err.responseText)
      # PDJStools.logg(err)
      # TODO Handle these:
      # 0 Failed to connect to anything
      # 401 bad auth
      # 400 Thing not found
    PDJStools.logg(params)
    $.ajax(params)

  attach_things: (subdomain, token, refresh=60) =>
    this.subdomain = subdomain
    this.token = token
    this.refresh = refresh
    this.services = {}
    this.update_things()
    # setInterval =>
    #  this.update_things()
    #, refresh*1000
  update_things: () =>
    for s in $(".pdjs_service_incidents")
      this.update_service_incidents(s.id)
    for s in $(".pdjs_service")
      this.update_service(s.id)
    for s in $(".pdjs_schedule")
      this.update_schedule(s.id)


jQuery -> 
  window.PDJS = new window.PDJSobj
  PDJS.attach_things(pdjs_settings.subdomain, pdjs_settings.token, pdjs_settings.refresh)
  window.PDJS.update_schedule("PQBSD51")

