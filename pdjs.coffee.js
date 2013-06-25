var PDJSobj, SECONDS_IN_A_DAY, getNotificationPermission, logg, showNotification, timeAsWords, timeBetween, timeUntil,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

SECONDS_IN_A_DAY = 24 * 60 * 60 * 1000;

showNotification = function(title, message) {
  var notification;
  notification = window.webkitNotifications.createNotification('http://metrics.pd-internal.com/assets/alex_unhappy.png', title, message);
  notification.onclick = function() {
    return logg("Clicked");
  };
  return notification.show();
};

getNotificationPermission = function() {
  var w;
  w = window.webkitNotifications.checkPermission();
  if (w === 0) {
    return logg("Can make desktop notifications");
  } else {
    logg("Can't make desktop notifications, asking");
    return window.webkitNotifications.requestPermission();
  }
};

logg = function(str) {
  return console.log(str);
};

timeUntil = function(time) {
  return timeBetween(time, new Date());
};

timeBetween = function(start, end) {
  var delta;
  if (typeof start === "string") {
    start = new Date(start);
  }
  if (typeof end === "string") {
    end = new Date(end);
  }
  delta = Math.abs(end - start);
  return timeAsWords(delta);
};

timeAsWords = function(delta) {
  var a, b, diffs, f, i, num, str;
  if (delta < 1000) {
    return "0 seconds";
  }
  diffs = [[1000, "millisecond"], [60, "second"], [60, "minute"], [24, "hour"], [7, "day"], [52, "week"], [99999, "year"]];
  f = SECONDS_IN_A_DAY * 7 * 52;
  str = "f: " + f;
  i = diffs.length - 1;
  num = (function() {
    var _results;
    _results = [];
    while (i -= 1) {
      if (delta > f) {
        a = Math.floor(delta / f);
        str = a + " " + diffs[i + 1][1];
        if (a > 1) {
          str += "s";
        }
        if (i > 0) {
          b = Math.floor((delta % f) / (f / diffs[i][0]));
          if (b > 0) {
            str = str + " and " + b + " " + diffs[i][1];
          }
          if (b > 1) {
            str += "s";
          }
        }
        delta = 0;
      }
      _results.push(f = f / diffs[i][0]);
    }
    return _results;
  })();
  return str;
};

PDJSobj = (function() {
  function PDJSobj() {
    this.update_things = __bind(this.update_things, this);
    this.attach_things = __bind(this.attach_things, this);
  }

  PDJSobj.prototype.set_token = function(token) {
    return this.token = token;
  };

  PDJSobj.prototype.set_subdomain = function(subdomain) {
    return this.subdomain = subdomain;
  };

  PDJSobj.prototype.update_service_incidents = function(service_id) {
    var params, since_date, until_date;
    until_date = new Date();
    since_date = new Date(until_date.getTime() - 90 * SECONDS_IN_A_DAY);
    params = {
      url: "https://" + this.subdomain + ".pagerduty.com/api/v1/incidents",
      type: "GET",
      headers: {
        Authorization: 'Token token=' + this.token
      },
      data: {
        status: "resolved",
        service: service_id,
        sort_by: 'created_on:desc',
        "since": since_date.toISOString(),
        "until": until_date.toISOString()
      },
      success: function(json) {
        var best_time, heroes, i, leader, max, results, t, total_time, worst_time, _i, _len, _ref;
        logg(json);
        heroes = {};
        total_time = 0;
        worst_time = 0;
        best_time = SECONDS_IN_A_DAY * 365;
        max = 0;
        leader = 'no-one';
        _ref = json.incidents;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          i = _ref[_i];
          t = new Date(i.last_status_change_on) - new Date(i.created_on);
          worst_time = Math.max(worst_time, t);
          best_time = Math.min(best_time, t);
          total_time += t;
          heroes[i.last_status_change_by.name] = (heroes[i.last_status_change_by.name] || 0) + 1;
          if (heroes[i.last_status_change_by.name] > max) {
            max = heroes[i.last_status_change_by.name];
            leader = i.last_status_change_by.name;
          }
        }
        results = {
          best_time: timeAsWords(best_time),
          worst_time: timeAsWords(worst_time),
          total_time: timeAsWords(total_time),
          average_time: timeAsWords(total_time / json.incidents.length),
          uptime: (new String((1 - (total_time / (SECONDS_IN_A_DAY * 90))) * 100)).substr(0, 5),
          leader: leader,
          leader_resolves: max,
          heroes: heroes
        };
        $("#" + service_id + ".pdjs_service_incidents").html("The average incident takes " + results.average_time + " ( " + results.best_time + " - " + results.worst_time + " ) " + results.leader + " has resolved " + results.leader_resolves + " incidents");
        return results;
      }
    };
    console.log(params);
    return $.ajax(params);
  };

  PDJSobj.prototype.open_service = function(me) {
    return window.open("https://" + this.subdomain + ".pagerduty.com/services/" + me.id);
  };

  PDJSobj.prototype.update_service = function(service_id) {
    var params,
      _this = this;
    logg("update_service: " + service_id + " at " + this.subdomain);
    params = {
      url: "https://" + this.subdomain + ".pagerduty.com/api/v1/services/" + service_id,
      type: "GET",
      headers: {
        Authorization: 'Token token=' + this.token
      },
      success: function(json) {
        var desc, status;
        status = "resolved";
        if (json.service.incident_counts.acknowledged) {
          status = "acknowledged";
        }
        if (json.service.incident_counts.triggered) {
          status = "triggered";
        }
        if (json.service.status === "disabled") {
          status = "disabled";
        }
        if (_this.services[service_id] !== status) {
          if (_this.services[service_id]) {
            showNotification("PagerDuty: " + status, "Service " + service_id + " changed from " + _this.services[service_id] + " to " + status);
          }
          _this.services[service_id] = status;
          desc = "Service: \"" + json.service.name + "\" was " + status + " as of " + timeUntil(json.service.last_incident_timestamp);
          $("#" + service_id + ".pdjs_service").removeClass("pdjs_triggered").removeClass("pdjs_acknowledged").removeClass("pdjs_resolved").removeClass("pdjs_disabled");
          return $("#" + service_id + ".pdjs_service").attr("title", desc).addClass("pdjs_" + status);
        }
      }
    };
    return $.ajax(params);
  };

  PDJSobj.prototype.update_schedule = function(schedule_id) {
    var params;
    logg("update_schedule: " + schedule_id);
    params = {
      url: "https://" + this.subdomain + ".pagerduty.com/api/v1/schedules/" + schedule_id + "/entries",
      type: "GET",
      headers: {
        Authorization: 'Token token=' + this.token
      },
      data: {
        "overflow": "true",
        "since": (new Date()).toISOString(),
        "until": (new Date()).toISOString()
      },
      success: function(json) {
        var end, on_call, status;
        logg(json);
        on_call = json.entries[0];
        end = new Date(on_call.end);
        status = "<a href=\"https://pdt-dave.pagerduty.com/users/" + on_call.user.id + "\" target=\"_blank\">" + on_call.user.name + "</a> is on call for another " + timeUntil(end);
        return $("#" + schedule_id + ".pdjs_schedule").html(status);
      }
    };
    return $.ajax(params);
  };

  PDJSobj.prototype.api = function(url) {};

  PDJSobj.prototype.attach_things = function(subdomain, token, refresh) {
    var _this = this;
    if (refresh == null) {
      refresh = 60;
    }
    getNotificationPermission();
    this.subdomain = subdomain;
    this.token = token;
    this.refresh = refresh;
    this.services = {};
    this.update_things();
    return setInterval(function() {
      return _this.update_things();
    }, refresh * 1000);
  };

  PDJSobj.prototype.update_things = function() {
    var s, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2, _results;
    _ref = $(".pdjs_service_incidents");
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      s = _ref[_i];
      this.update_service_incidents(s.id);
    }
    _ref1 = $(".pdjs_service");
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      s = _ref1[_j];
      this.update_service(s.id);
    }
    _ref2 = $(".pdjs_schedule");
    _results = [];
    for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
      s = _ref2[_k];
      _results.push(this.update_schedule(s.id));
    }
    return _results;
  };

  return PDJSobj;

})();

jQuery(function() {
  window.PDJS = new PDJSobj;
  return PDJS.attach_things(pdjs_settings.subdomain, pdjs_settings.token, pdjs_settings.refresh);
});