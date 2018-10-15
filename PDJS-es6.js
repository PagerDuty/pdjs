class PDJSObj{
  function logg(str) {
    if (this.logging) {
        return console.log(str);
    }
  }

  function req(){
    return this.req_count++;
  }

  constructor(params) {
    let _ref;
    if (params == null) {
      params = {};
    }
    this.subdomain = params.subdomain;
    this.async = (_ref = params.async === false) != null ? _ref : {
        "false": true
      };
    this.token = params.token;
    this.refresh = params.refresh || 60;
    this.refresh_in_ms = this.refresh * 1000;
    this.protocol = params.protocol || "https";
    this.server = params.server || "pagerduty.com";
    this.logging = params.logging || false;
    this.req_count = 1;
    this.api_version = params.api_version || "v2";
    this.logg("Initializing PDJSobj");
  }

  function no_success_function(json, callerparams) {
    this.logg("no success function defined for " + callerparams.res);
    return this.logg(json);
  }

  function error_function(err, callerparams) {
    let anyerror, error_detail;
    console.log("Error for " + callerparams.res);
    console.log(err.status);
    error_detail = err.responseText;
    try {
      error_detail = JSON.parse(error_detail);
      } catch (_error) {
        anyerror = _error;
        this.logg("Not an JSON error");
      }
      return console.log(error_detail);
    };
  }

  function api(params){
    if (params == null) {
      params = {};
    }
    this.logg("Call to API: " + params.res);
    params.url = params.url || this.protocol + "://api." + this.server + "/" + params.res;
    params.attempt = params.attempt || 0;
    params.async = params.async || this.async;
    params.headers = params.headers || {};
    params.contentType = "application/json; charset=utf-8";
    params.dataType = "json";
    if(this.api_version == "v2"){
      params.accepts = {json: 'application/vnd.pagerduty+json;version=2'};
    }
    params.data = params.data || {};
    params.data.PDJSversion = PDJSobj.version;
    params.data.request_count = this.req();
    params.data.attempt = params.attempt++;
    this.logg("params.data:");
    this.logg(params.data);
    params.type = (params.type || "GET").toUpperCase();
    if (params.type === "POST" || params.type === "PUT") {
      params.data = JSON.stringify(params.data);
    }
    params.headers.Authorization = 'Token token=' + this.token;
    params.error = params.error || (function(_this) {
      return function(err) {
        return _this.error_function(err, params);
      };
    })(this);
    params.success = params.success || (function(_this) {
      return function(data) {
        return _this.no_success_function(data, params);
      };
    })(this);
    this.logg(params);
    return $.ajax(params);
  }



}
