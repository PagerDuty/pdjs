class window.PDJStools
  @SECONDS_IN_A_DAY = 24*60*60*1000
  @logging = true
  @logg: (str) ->
    if(@logging)
      console.log(str)
  @timeUntil: (time) ->
    @timeBetween(time, new Date())
  @timeBetween: (start, end) ->
    if(typeof start == "string") 
      start = new Date(start)
    if(typeof end == "string") 
      end = new Date(end)
    delta = Math.abs(end - start)
    @timeAsWords(delta)
  @timeAsWords: (delta) ->
    if(delta<1000) 
      return "0 seconds";
    diffs = [
      [1000,"millisecond"]
      [60,"second"]
      [60,"minute"]
      [24,"hour"]
      [7,"day"]
      [52,"week"]
      [99999,"year"]
    ]
    f = @SECONDS_IN_A_DAY * 7 * 52;
    str = "f: " + f
    i = diffs.length-1
    num = while i -= 1
      if(delta>f)
        a = Math.floor(delta/f)
        str = a + " " + diffs[i+1][1]
        if(a>1) 
          str += "s"
        if(i>0)
          b = Math.floor((delta%f)/(f/diffs[i][0]))
          if(b>0) 
            str = str + " and " + b + " " + diffs[i][1]
          if(b>1) 
            str += "s"
        delta = 0
      f = f/diffs[i][0]
    str

window.PDJSt = PDJStools
PDJStools.logg("test")