var PagerDuty;(()=>{var t={818:(t,e)=>{"use strict";var r="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},n="undefined"!=typeof window&&void 0!==window.document;"object"===("undefined"==typeof self?"undefined":r(self))&&self.constructor&&self.constructor.name,"undefined"!=typeof process&&null!=process.versions&&process.versions.node;e.jU=n},98:function(t,e){var r="undefined"!=typeof self?self:this,n=function(){function t(){this.fetch=!1,this.DOMException=r.DOMException}return t.prototype=r,new t}();!function(t){!function(e){var r="URLSearchParams"in t,n="Symbol"in t&&"iterator"in Symbol,o="FileReader"in t&&"Blob"in t&&function(){try{return new Blob,!0}catch(t){return!1}}(),i="FormData"in t,s="ArrayBuffer"in t;if(s)var u=["[object Int8Array]","[object Uint8Array]","[object Uint8ClampedArray]","[object Int16Array]","[object Uint16Array]","[object Int32Array]","[object Uint32Array]","[object Float32Array]","[object Float64Array]"],a=ArrayBuffer.isView||function(t){return t&&u.indexOf(Object.prototype.toString.call(t))>-1};function c(t){if("string"!=typeof t&&(t=String(t)),/[^a-z0-9\-#$%&'*+.^_`|~]/i.test(t))throw new TypeError("Invalid character in header field name");return t.toLowerCase()}function f(t){return"string"!=typeof t&&(t=String(t)),t}function p(t){var e={next:function(){var e=t.shift();return{done:void 0===e,value:e}}};return n&&(e[Symbol.iterator]=function(){return e}),e}function l(t){this.map={},t instanceof l?t.forEach((function(t,e){this.append(e,t)}),this):Array.isArray(t)?t.forEach((function(t){this.append(t[0],t[1])}),this):t&&Object.getOwnPropertyNames(t).forEach((function(e){this.append(e,t[e])}),this)}function y(t){if(t.bodyUsed)return Promise.reject(new TypeError("Already read"));t.bodyUsed=!0}function h(t){return new Promise((function(e,r){t.onload=function(){e(t.result)},t.onerror=function(){r(t.error)}}))}function d(t){var e=new FileReader,r=h(e);return e.readAsArrayBuffer(t),r}function b(t){if(t.slice)return t.slice(0);var e=new Uint8Array(t.byteLength);return e.set(new Uint8Array(t)),e.buffer}function m(){return this.bodyUsed=!1,this._initBody=function(t){var e;this._bodyInit=t,t?"string"==typeof t?this._bodyText=t:o&&Blob.prototype.isPrototypeOf(t)?this._bodyBlob=t:i&&FormData.prototype.isPrototypeOf(t)?this._bodyFormData=t:r&&URLSearchParams.prototype.isPrototypeOf(t)?this._bodyText=t.toString():s&&o&&(e=t)&&DataView.prototype.isPrototypeOf(e)?(this._bodyArrayBuffer=b(t.buffer),this._bodyInit=new Blob([this._bodyArrayBuffer])):s&&(ArrayBuffer.prototype.isPrototypeOf(t)||a(t))?this._bodyArrayBuffer=b(t):this._bodyText=t=Object.prototype.toString.call(t):this._bodyText="",this.headers.get("content-type")||("string"==typeof t?this.headers.set("content-type","text/plain;charset=UTF-8"):this._bodyBlob&&this._bodyBlob.type?this.headers.set("content-type",this._bodyBlob.type):r&&URLSearchParams.prototype.isPrototypeOf(t)&&this.headers.set("content-type","application/x-www-form-urlencoded;charset=UTF-8"))},o&&(this.blob=function(){var t=y(this);if(t)return t;if(this._bodyBlob)return Promise.resolve(this._bodyBlob);if(this._bodyArrayBuffer)return Promise.resolve(new Blob([this._bodyArrayBuffer]));if(this._bodyFormData)throw new Error("could not read FormData body as blob");return Promise.resolve(new Blob([this._bodyText]))},this.arrayBuffer=function(){return this._bodyArrayBuffer?y(this)||Promise.resolve(this._bodyArrayBuffer):this.blob().then(d)}),this.text=function(){var t,e,r,n=y(this);if(n)return n;if(this._bodyBlob)return t=this._bodyBlob,r=h(e=new FileReader),e.readAsText(t),r;if(this._bodyArrayBuffer)return Promise.resolve(function(t){for(var e=new Uint8Array(t),r=new Array(e.length),n=0;n<e.length;n++)r[n]=String.fromCharCode(e[n]);return r.join("")}(this._bodyArrayBuffer));if(this._bodyFormData)throw new Error("could not read FormData body as text");return Promise.resolve(this._bodyText)},i&&(this.formData=function(){return this.text().then(g)}),this.json=function(){return this.text().then(JSON.parse)},this}l.prototype.append=function(t,e){t=c(t),e=f(e);var r=this.map[t];this.map[t]=r?r+", "+e:e},l.prototype.delete=function(t){delete this.map[c(t)]},l.prototype.get=function(t){return t=c(t),this.has(t)?this.map[t]:null},l.prototype.has=function(t){return this.map.hasOwnProperty(c(t))},l.prototype.set=function(t,e){this.map[c(t)]=f(e)},l.prototype.forEach=function(t,e){for(var r in this.map)this.map.hasOwnProperty(r)&&t.call(e,this.map[r],r,this)},l.prototype.keys=function(){var t=[];return this.forEach((function(e,r){t.push(r)})),p(t)},l.prototype.values=function(){var t=[];return this.forEach((function(e){t.push(e)})),p(t)},l.prototype.entries=function(){var t=[];return this.forEach((function(e,r){t.push([r,e])})),p(t)},n&&(l.prototype[Symbol.iterator]=l.prototype.entries);var v=["DELETE","GET","HEAD","OPTIONS","POST","PUT"];function O(t,e){var r,n,o=(e=e||{}).body;if(t instanceof O){if(t.bodyUsed)throw new TypeError("Already read");this.url=t.url,this.credentials=t.credentials,e.headers||(this.headers=new l(t.headers)),this.method=t.method,this.mode=t.mode,this.signal=t.signal,o||null==t._bodyInit||(o=t._bodyInit,t.bodyUsed=!0)}else this.url=String(t);if(this.credentials=e.credentials||this.credentials||"same-origin",!e.headers&&this.headers||(this.headers=new l(e.headers)),this.method=(n=(r=e.method||this.method||"GET").toUpperCase(),v.indexOf(n)>-1?n:r),this.mode=e.mode||this.mode||null,this.signal=e.signal||this.signal,this.referrer=null,("GET"===this.method||"HEAD"===this.method)&&o)throw new TypeError("Body not allowed for GET or HEAD requests");this._initBody(o)}function g(t){var e=new FormData;return t.trim().split("&").forEach((function(t){if(t){var r=t.split("="),n=r.shift().replace(/\+/g," "),o=r.join("=").replace(/\+/g," ");e.append(decodeURIComponent(n),decodeURIComponent(o))}})),e}function w(t,e){e||(e={}),this.type="default",this.status=void 0===e.status?200:e.status,this.ok=this.status>=200&&this.status<300,this.statusText="statusText"in e?e.statusText:"OK",this.headers=new l(e.headers),this.url=e.url||"",this._initBody(t)}O.prototype.clone=function(){return new O(this,{body:this._bodyInit})},m.call(O.prototype),m.call(w.prototype),w.prototype.clone=function(){return new w(this._bodyInit,{status:this.status,statusText:this.statusText,headers:new l(this.headers),url:this.url})},w.error=function(){var t=new w(null,{status:0,statusText:""});return t.type="error",t};var j=[301,302,303,307,308];w.redirect=function(t,e){if(-1===j.indexOf(e))throw new RangeError("Invalid status code");return new w(null,{status:e,headers:{location:t}})},e.DOMException=t.DOMException;try{new e.DOMException}catch(t){e.DOMException=function(t,e){this.message=t,this.name=e;var r=Error(t);this.stack=r.stack},e.DOMException.prototype=Object.create(Error.prototype),e.DOMException.prototype.constructor=e.DOMException}function P(t,r){return new Promise((function(n,i){var s=new O(t,r);if(s.signal&&s.signal.aborted)return i(new e.DOMException("Aborted","AbortError"));var u=new XMLHttpRequest;function a(){u.abort()}u.onload=function(){var t,e,r={status:u.status,statusText:u.statusText,headers:(t=u.getAllResponseHeaders()||"",e=new l,t.replace(/\r?\n[\t ]+/g," ").split(/\r?\n/).forEach((function(t){var r=t.split(":"),n=r.shift().trim();if(n){var o=r.join(":").trim();e.append(n,o)}})),e)};r.url="responseURL"in u?u.responseURL:r.headers.get("X-Request-URL");var o="response"in u?u.response:u.responseText;n(new w(o,r))},u.onerror=function(){i(new TypeError("Network request failed"))},u.ontimeout=function(){i(new TypeError("Network request failed"))},u.onabort=function(){i(new e.DOMException("Aborted","AbortError"))},u.open(s.method,s.url,!0),"include"===s.credentials?u.withCredentials=!0:"omit"===s.credentials&&(u.withCredentials=!1),"responseType"in u&&o&&(u.responseType="blob"),s.headers.forEach((function(t,e){u.setRequestHeader(e,t)})),s.signal&&(s.signal.addEventListener("abort",a),u.onreadystatechange=function(){4===u.readyState&&s.signal.removeEventListener("abort",a)}),u.send(void 0===s._bodyInit?null:s._bodyInit)}))}P.polyfill=!0,t.fetch||(t.fetch=P,t.Headers=l,t.Request=O,t.Response=w),e.Headers=l,e.Request=O,e.Response=w,e.fetch=P,Object.defineProperty(e,"__esModule",{value:!0})}({})}(n),n.fetch.ponyfill=!0,delete n.fetch.polyfill;var o=n;(e=o.fetch).default=o.fetch,e.fetch=o.fetch,e.Headers=o.Headers,e.Request=o.Request,e.Response=o.Response,t.exports=e}},e={};function r(n){var o=e[n];if(void 0!==o)return o.exports;var i=e[n]={exports:{}};return t[n].call(i.exports,i,i.exports,r),i.exports}r.n=t=>{var e=t&&t.__esModule?()=>t.default:()=>t;return r.d(e,{a:e}),e},r.d=(t,e)=>{for(var n in e)r.o(e,n)&&!r.o(t,n)&&Object.defineProperty(t,n,{enumerable:!0,get:e[n]})},r.o=(t,e)=>Object.prototype.hasOwnProperty.call(t,e),r.r=t=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})};var n={};(()=>{"use strict";r.r(n),r.d(n,{acknowledge:()=>k,api:()=>x,change:()=>I,event:()=>B,resolve:()=>q,trigger:()=>U});var t=r(98),e=r.n(t),o=r(818);function i(t,e){var r=Object.keys(t);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(t);e&&(n=n.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),r.push.apply(r,n)}return r}function s(t){for(var e=1;e<arguments.length;e++){var r=null!=arguments[e]?arguments[e]:{};e%2?i(Object(r),!0).forEach((function(e){u(t,e,r[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(r)):i(Object(r)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(r,e))}))}return t}function u(t,e,r){return e in t?Object.defineProperty(t,e,{value:r,enumerable:!0,configurable:!0,writable:!0}):t[e]=r,t}function a(t,e){if(null==t)return{};var r,n,o=function(t,e){if(null==t)return{};var r,n,o={},i=Object.keys(t);for(n=0;n<i.length;n++)r=i[n],e.indexOf(r)>=0||(o[r]=t[r]);return o}(t,e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(t);for(n=0;n<i.length;n++)r=i[n],e.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(t,r)&&(o[r]=t[r])}return o}function c(e){var r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},n=r.queryParameters,o=r.requestTimeout,i=void 0===o?3e4:o,u=a(r,["queryParameters","requestTimeout"]);return e=y(e=new URL(e.toString()),n),u=h(u,i),f(e.toString(),3,s(s({},u),{},{headers:new t.Headers(s(s({"Content-Type":"application/json; charset=utf-8"},l()),u.headers))}))}function f(t,r,n){return new Promise((function(o,i){e()(t,n).then((function(e){if(0===r)return o(e);if(429===e.status){var s=n.retryTimeout;p(void 0===s?2e4:s).then((function(){f(t,r-1,n).then(o).catch(i)}))}else clearTimeout(n.requestTimer),o(e)})).catch(i)}))}var p=function(t){return new Promise((function(e){return setTimeout(e,t)}))};function l(){return o.jU?{}:{"User-Agent":"pdjs/".concat("2.0.0"," (").concat(process.version,"/").concat(process.platform,")")}}function y(t,e){if(!e)return t;for(var r=t.searchParams,n=function(){var t=i[o],n=e[t];Array.isArray(n)?n.forEach((function(e){r.append(t,e)})):r.append(t,n)},o=0,i=Object.keys(e);o<i.length;o++)n();return t.search=r.toString(),t}function h(t,e){if(!e)return t;var r=setTimeout((function(){}),e);return s(s({},t),{},{requestTimer:r})}function d(t){return(d="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}function b(t,e){b=function(t,e){return new i(t,void 0,e)};var r=v(RegExp),n=RegExp.prototype,o=new WeakMap;function i(t,e,n){var i=r.call(this,t,e);return o.set(i,n||o.get(t)),i}function s(t,e){var r=o.get(e);return Object.keys(r).reduce((function(e,n){return e[n]=t[r[n]],e}),Object.create(null))}return m(i,r),i.prototype.exec=function(t){var e=n.exec.call(this,t);return e&&(e.groups=s(e,this)),e},i.prototype[Symbol.replace]=function(t,e){if("string"==typeof e){var r=o.get(this);return n[Symbol.replace].call(this,t,e.replace(/\$<([^>]+)>/g,(function(t,e){return"$"+r[e]})))}if("function"==typeof e){var i=this;return n[Symbol.replace].call(this,t,(function(){var t=[];return t.push.apply(t,arguments),"object"!==d(t[t.length-1])&&t.push(s(t,i)),e.apply(this,t)}))}return n[Symbol.replace].call(this,t,e)},b.apply(this,arguments)}function m(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function");t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,writable:!0,configurable:!0}}),e&&w(t,e)}function v(t){var e="function"==typeof Map?new Map:void 0;return(v=function(t){if(null===t||(r=t,-1===Function.toString.call(r).indexOf("[native code]")))return t;var r;if("function"!=typeof t)throw new TypeError("Super expression must either be null or a function");if(void 0!==e){if(e.has(t))return e.get(t);e.set(t,n)}function n(){return O(t,arguments,j(this).constructor)}return n.prototype=Object.create(t.prototype,{constructor:{value:n,enumerable:!1,writable:!0,configurable:!0}}),w(n,t)})(t)}function O(t,e,r){return(O=g()?Reflect.construct:function(t,e,r){var n=[null];n.push.apply(n,e);var o=new(Function.bind.apply(t,n));return r&&w(o,r.prototype),o}).apply(null,arguments)}function g(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(t){return!1}}function w(t,e){return(w=Object.setPrototypeOf||function(t,e){return t.__proto__=e,t})(t,e)}function j(t){return(j=Object.setPrototypeOf?Object.getPrototypeOf:function(t){return t.__proto__||Object.getPrototypeOf(t)})(t)}function P(t,e){var r=Object.keys(t);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(t);e&&(n=n.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),r.push.apply(r,n)}return r}function E(t){for(var e=1;e<arguments.length;e++){var r=null!=arguments[e]?arguments[e]:{};e%2?P(Object(r),!0).forEach((function(e){S(t,e,r[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(r)):P(Object(r)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(r,e))}))}return t}function S(t,e,r){return e in t?Object.defineProperty(t,e,{value:r,enumerable:!0,configurable:!0,writable:!0}):t[e]=r,t}function x(t){if(!t.endpoint&&!t.url)return function(t){var e=t,r=function(t){return x(E(E({},e),t))},n=function(t){return function(r,n){return x(E(E({endpoint:r,method:t},e),n))}};return r.get=n("get"),r.post=n("post"),r.put=n("put"),r.patch=n("patch"),r.delete=n("delete"),r.all=function(t,r){function n(t){var e=t[t.length-1];return e.next?e.next().then((function(e){return n(t.concat([e]))})):Promise.resolve(t)}return x(E(E({endpoint:t,method:"get"},e),r)).then((function(t){return n([t])})).then((function(t){return function(t){var e=t.shift();return e.data=[e.data],t.forEach((function(t){e.data=e.data.concat(t.data),e.resource=e.resource.concat(t.resource)})),Promise.resolve(e)}(t)}))},r}(t);var e,r,n,o=t.endpoint,i=t.server,s=void 0===i?"api.pagerduty.com":i,u=t.token,a=t.tokenType,c=void 0===a?t.tokenType||"token":a,f=t.url,p=t.version,l=void 0===p?2:p,y=t.data,h=function(t,e){if(null==t)return{};var r,n,o=function(t,e){if(null==t)return{};var r,n,o={},i=Object.keys(t);for(n=0;n<i.length;n++)r=i[n],e.indexOf(r)>=0||(o[r]=t[r]);return o}(t,e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(t);for(n=0;n<i.length;n++)r=i[n],e.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(t,r)&&(o[r]=t[r])}return o}(t,["endpoint","server","token","tokenType","url","version","data"]),d=E(E({method:"GET"},h),{},{headers:E({Accept:"application/vnd.pagerduty+json;version=".concat(l),Authorization:"".concat({bearer:"Bearer ",token:"Token token="}[c]).concat(u)},h.headers)});return r=d.method,!["PUT","POST","DELETE","PATCH"].includes(null!==(n=r.toUpperCase())&&void 0!==n?n:"GET")&&y?d.queryParameters=null!==(e=d.queryParameters)&&void 0!==e?e:y:d.body=JSON.stringify(y),T(null!=f?f:"https://".concat(s,"/").concat(o.replace(/^\/+/,"")),d)}function T(t,e){return c(t,e).then((function(r){var n=r;return n.response=r,204===r.status?Promise.resolve(n):r.json().then((function(r){var o=function(t,e){var r=t.match(b(/.+.com\/([0-9A-Z_a-z]+)/,{resource:1}));if(r){var n=r[1];return e&&"get"===e.toLowerCase()?n:n.endsWith("ies")?n.slice(0,-3)+"y":n.endsWith("s")?n.slice(0,-1):n}return null}(t,e.method);return n.next=function(t,e,r){if(function(t){return void 0!==t.offset}(r)){if(null!=r&&r.more&&void 0!==d(r.offset)&&r.limit)return function(){return T(t,E(E({},e),{},{queryParameters:E(E({},e.queryParameters),{},{limit:r.limit.toString(),offset:(r.limit+r.offset).toString()})}))}}else if(function(t){return void 0!==t.cursor}(r)&&null!=r&&r.cursor)return function(){return T(t,E(E({},e),{},{queryParameters:E(E({},e.queryParameters),{},{cursor:r.cursor,limit:r.limit.toString()})}))}}(t,e,r),n.data=r,n.resource=o?r[o]:null,n})).catch((function(){return Promise.reject(n)}))}))}function _(t,e){var r=Object.keys(t);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(t);e&&(n=n.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),r.push.apply(r,n)}return r}function A(t){for(var e=1;e<arguments.length;e++){var r=null!=arguments[e]?arguments[e]:{};e%2?_(Object(r),!0).forEach((function(e){D(t,e,r[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(r)):_(Object(r)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(r,e))}))}return t}function D(t,e,r){return e in t?Object.defineProperty(t,e,{value:r,enumerable:!0,configurable:!0,writable:!0}):t[e]=r,t}function B(t){var e=t.server,r=void 0===e?"events.pagerduty.com":e,n=t.type,o=void 0===n?"event":n,i=t.data,s=function(t,e){if(null==t)return{};var r,n,o=function(t,e){if(null==t)return{};var r,n,o={},i=Object.keys(t);for(n=0;n<i.length;n++)r=i[n],e.indexOf(r)>=0||(o[r]=t[r]);return o}(t,e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(t);for(n=0;n<i.length;n++)r=i[n],e.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(t,r)&&(o[r]=t[r])}return o}(t,["server","type","data"]),u="https://".concat(r,"/v2/enqueue");return"change"===o&&(u="https://".concat(r,"/v2/change/enqueue")),function(t,e){return c(t,e).then((function(t){var e=t;return t.json().then((function(r){return e.data=r,e.response=t,e}))}))}(u,A({method:"POST",body:JSON.stringify(i)},s))}var R=function(t){return function(e){return B(A(A({},e),{},{data:A(A({},e.data),{},D({},"event_action",t))}))}},U=R("trigger"),k=R("acknowledge"),q=R("resolve"),I=function(t){return B(A(A({},t),{},{type:"change"}))}})(),PagerDuty=n})();
//# sourceMappingURL=pdjs-legacy.js.map