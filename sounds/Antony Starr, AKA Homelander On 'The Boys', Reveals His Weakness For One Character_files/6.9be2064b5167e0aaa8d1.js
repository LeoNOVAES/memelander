/* Copyright 2024 Penske Media Corporation.  All Rights Reserved. */
(window.__pmc_atlas_mg_webpack_jsonp__=window.__pmc_atlas_mg_webpack_jsonp__||[]).push([[6],{2:function(t,n,e){"use strict";var r=e(27),o=e(6);const c=window,u=new Map,i=new Map;let a=[],f=!1;function d(t,...n){c.console.error("%cP%cM%cC Atlas MG","padding: 2px 1px 2px 10px; border-radius: 7px 0 0 7px; background-color: black; color: white;","padding: 2px 1px; background-color: black; color: #ed1c24;","padding: 2px 10px 2px 1px; border-radius: 0 7px 7px 0; background-color: black; color: white;",t,...n)}function s(t,n){f||d(`Attempted to ${t} config for ${n} before config was hydrated.`)}function l(t){if("string"!=typeof t||!t)throw new Error("Invalid configuration key provided.");if(t.startsWith("_"))throw new Error("Attempted to access a private configuration.");return t}function p(t){return s("get",t),i.get(t)}function h(t,n){s("set",t);const e=u.get(t);e&&(n=e(n)),i.set(t,n)}function m(t){s("delete",t),i.delete(t)}function g(t){return p(l(t))}function y(t,n){h(l(t),n)}function b(t){m(l(t))}n.a={hydrate:function(t){var n;if(f)throw new Error("Initial configuration already supplied to Atlas MG. Use blogherads.setConf to update the configuration.");if(!function(t){return"object"==typeof t&&null!==t&&Boolean(t.dfp_name)}(t))throw new Error("Invalid configuration supplied to Atlas MG.");f=!0;for(const n of Object.keys(t))i.set(n,t[n]);Object(r.a)("skconfig").forEach(t=>{const n=t.split(":"),e=n.shift();let r;if(e){if(n.length>=2&&""===n[0]){n.shift();const t=n.join(":");try{r=JSON.parse(decodeURIComponent(t))}catch(n){d(`Unable to parse JSON from query string for key ${e}: ${t}\n`,n)}}else r=n.join(":");try{y(e,r)}catch(t){d("Unable to set config from query string: "+(t instanceof Error?t.message:t))}}}),Object(r.c)("skdebug")&&h("debug",!0),Object(o.a)("getConf",g),Object(o.a)("setConf",y),Object(o.a)("delConf",b),null===(n=a)||void 0===n||n.forEach(t=>t()),a=null},get:p,set:h,del:m,registerConfigSetter:function(t,n){u.set(t,n)},ready:function(){return new Promise(t=>{a?a.push(t):t()})},publicGet:g,publicSet:y,publicDel:b}},27:function(t,n,e){"use strict";e.d(n,"c",(function(){return a})),e.d(n,"d",(function(){return f})),e.d(n,"b",(function(){return d})),e.d(n,"a",(function(){return s}));let r,o=[];function c(t){return t?t.substring(1).split("&"):[]}function u(t,n){o=[...n,...t]}function i(){const t=window.location.search,n=window.location.hash;t||n?r!==t+n&&(r=t+n,u(c(t),c(n))):u([],[])}function a(t){return i(),o.includes(t)}function f(t){return i(),o.some(n=>n.split("=")[0]===t)}function d(t){i();for(const n of o){const e=n.split("=");if(e[0]===t)return e[1]?decodeURIComponent(e[1]):""}}function s(t){return i(),o.reduce((n,e)=>{if(e.startsWith(t+"=")){const t=e.split("=")[1];t&&n.push(decodeURIComponent(t))}return n},[])}},3:function(t,n,e){"use strict";e.d(n,"y",(function(){return o})),e.d(n,"H",(function(){return c})),e.d(n,"G",(function(){return u})),e.d(n,"i",(function(){return i})),e.d(n,"r",(function(){return a})),e.d(n,"v",(function(){return f})),e.d(n,"o",(function(){return d})),e.d(n,"n",(function(){return s})),e.d(n,"j",(function(){return l})),e.d(n,"l",(function(){return h})),e.d(n,"m",(function(){return m})),e.d(n,"b",(function(){return g})),e.d(n,"u",(function(){return y})),e.d(n,"d",(function(){return b})),e.d(n,"M",(function(){return v})),e.d(n,"B",(function(){return x})),e.d(n,"O",(function(){return E})),e.d(n,"I",(function(){return j})),e.d(n,"h",(function(){return A})),e.d(n,"L",(function(){return S})),e.d(n,"s",(function(){return k})),e.d(n,"x",(function(){return I})),e.d(n,"t",(function(){return L})),e.d(n,"g",(function(){return O})),e.d(n,"q",(function(){return _})),e.d(n,"c",(function(){return $})),e.d(n,"K",(function(){return B})),e.d(n,"C",(function(){return N})),e.d(n,"E",(function(){return T})),e.d(n,"F",(function(){return M})),e.d(n,"p",(function(){return P})),e.d(n,"P",(function(){return D})),e.d(n,"a",(function(){return R})),e.d(n,"J",(function(){return U})),e.d(n,"f",(function(){return G})),e.d(n,"k",(function(){return F})),e.d(n,"e",(function(){return J})),e.d(n,"D",(function(){return X})),e.d(n,"N",(function(){return Y})),e.d(n,"Q",(function(){return q})),e.d(n,"R",(function(){return H})),e.d(n,"A",(function(){return W})),e.d(n,"w",(function(){return V})),e.d(n,"z",(function(){return z}));var r=e(2);function o(){return Date.now?Date.now():(new Date).getTime()}function c(t,n,e,r,o=null,c=null){const u=document.createElement("script"),i=document.getElementsByTagName("script")[0];if(c)for(const[t,n]of Object.entries(c))u.setAttribute(t,n);u.type="text/javascript",u.async=!0,(n||e)&&(u.onload=function(){"function"==typeof n&&n(),e&&u.parentNode.removeChild(u)}),(o||e)&&(u.onerror=function(t){"function"==typeof o&&o(t),e&&u.parentNode.removeChild(u)}),u.src=t,r&&(u.id=r),i.parentNode.insertBefore(u,i)}function u(t,n,e,r,o){c(`${"https:\/\/ads.blogherads.com"}/static/cached/${t}`,n,e,r,o)}function i(t){const n=document.createDocumentFragment(),e=document.createElement("div");for(e.innerHTML=t;e.firstChild;)n.appendChild(e.firstChild);return n}function a(t,n){const e=t.parentNode;return e?e===n?t:a(e,n):null}function f(t,n,e){const r=document.createTreeWalker(t,n,e,!1),o=[],c=(t,n)=>{for(;t&&t!==t.parentElement;){if(t&&t.parentElement===n)return t;t=t.parentElement}return null};let u;for(;u=r.nextNode();){const n=u.textContent?u.textContent:u.innerText?u.innerText:null;if(n&&""===n.replace(/(\r\n|\n|\r)/gm,""))continue;const e=c(u,t);e&&-1===o.indexOf(e)&&o.push(e)}return o}function d(t,n){const e=s("iframe",{src:t,id:n,width:0,height:0,ariaHidden:"true"});e.style.display="none",document.getElementsByTagName("body")[0].appendChild(e)}function s(t,n,e){const r=document.createElement(t);return r&&("object"==typeof n&&Object.keys(n).forEach(t=>{r[t]=n[t]}),"object"==typeof e&&Object.keys(e).forEach(t=>{r.setAttribute("data-"+t,e[t])})),r}function l(t,n){const e=document.createElement("div"),r=e.attachShadow({mode:"open"}),o=new CSSStyleSheet;return o.replaceSync(n),r.adoptedStyleSheets=[o],r.appendChild(t),e}function p(t,n){if(Array.isArray(n)||(n=n?[n]:[]),n.length){const e=document.getElementsByTagName("script")[0];n.forEach(n=>{const r=s("link",{rel:t,href:n});e.parentNode.insertBefore(r,e)})}}function h(t){p("dns-prefetch",t)}function m(t){p("preconnect",t)}function g(t,n,e){t.addEventListener(n,e,!1)}function y(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,(function(t){const n=16*Math.random()|0;return("x"===t?n:3&n|8).toString(16)}))}function b(t,n,e){"string"==typeof n&&(n=new RegExp(n));const r=n.test(t);return e?!r:r}function v(t){let n,e,r=t.length;for(;0!==r;)e=Math.floor(Math.random()*r),r-=1,n=t[r],t[r]=t[e],t[e]=n;return t}const w=function(){let t=0;return function(){return t++,t}}();function x(){return w()+Math.random().toString(16).substr(2)}function E(t,n,e){let r;function o(){r&&(clearTimeout(r),r=null)}const c=new Promise((n,c)=>{r=setTimeout(()=>{o(),c(Error(`${e} timed out in ${t}ms.`))},t)});return n.catch(()=>{}).then(o),Promise.race([n,c])}function j(t){function n(t){t.preventDefault(),o=t.clientX||t.touches[0].clientX,c=t.clientY||t.touches[0].clientY,document.addEventListener("mouseup",r),document.addEventListener("touchend",r),document.addEventListener("mousemove",e),document.addEventListener("touchmove",e)}function e(n){n.preventDefault();const e=n.clientX||n.touches[0].clientX,r=n.clientY||n.touches[0].clientY;t.style.top=t.offsetTop-(c-r)+"px",t.style.left=t.offsetLeft-(o-e)+"px",o=e,c=r}function r(){document.removeEventListener("mouseup",r),document.removeEventListener("touchend",r),document.removeEventListener("mousemove",e),document.removeEventListener("touchmove",e)}let o=0,c=0;const u=document.getElementById(t.id+"-header");u?(u.addEventListener("mousedown",n),u.addEventListener("touchstart",n)):(t.addEventListener("mousedown",n),t.addEventListener("touchstart",n))}function A(t){const n=document,e=n.createElement("input");n.body.appendChild(e),e.setAttribute("value",t),e.select(),n.execCommand("copy"),n.body.removeChild(e)}function C(t=window){return Boolean("object"==typeof t.context&&t.context.pageViewId)}function S(t){const n=document.createElement("a");n.href=t;const e={href:n.href,protocol:n.protocol,host:n.host,hostname:n.hostname,port:"0"===n.port?"":n.port,pathname:n.pathname,search:n.search,hash:n.hash};return"/"!==e.pathname[0]&&(e.pathname="/"+e.pathname),("http:"===e.protocol&&"80"===e.port||"https:"===e.protocol&&"443"===e.port)&&(e.port="",e.host=e.hostname),e}function k(t=window,n=!1){const e=t.top;try{return e.location.toString(),e.location}catch(t){}for(;t!==e;)try{t.parent.location.toString(),t=t.parent}catch(e){let r=t.document.referrer;if(C(t)){const e=t.context.sourceUrl;r=n?e:e.split("#")[0]}return S(r)}}function I(t){return t&&"function"==typeof t.getBoundingClientRect?t.getBoundingClientRect():null}function L(t){return encodeURIComponent(t).replace(/[!'()*]/g,(function(t){return"%"+t.charCodeAt(0).toString(16)}))}function O(t){return Array.isArray(t[0])||(t=[t]),t.map(t=>`${t[0]}x${t[1]}`)}function _(t){return Array.isArray(t[0])?t:[t]}function $(t){return 100===t||Math.random()<t/100}function B(t){return"string"==typeof t?t.toLowerCase().replace(/^www\./,""):t}function N(t){const n=t.length;let e=5381;for(let r=0;r<n;r++)e=33*e^t.charCodeAt(r);return String(e>>>0)}function T(t=window){if(t!==t.parent)try{return t.parent.location.toString(),!0}catch(t){return!1}return!1}function M(t=window){return Boolean(function(t,n=window){let e,r=n;try{if(e=n.top.location.toString(),e.includes(t))return e}catch(t){}for(;r!==n.top;)try{var o;if(e=null===(o=r.parent)||void 0===o?void 0:o.location.toString(),e.includes(t))return e;r=n.parent}catch(t){break}try{if(e=n.location.toString(),e.includes(t))return e}catch(t){}return null}("/wp-admin",t))}function P(t){return(Array.isArray(t)?t:[t]).map(t=>{try{return t.toString()}catch(t){return""}})}function D(t){function n(t){return Array.isArray(t)&&2===t.length&&"number"==typeof t[0]&&"number"==typeof t[1]&&t[0]>=0&&t[1]>=0}return!!Array.isArray(t)&&(Array.isArray(t[0])?!t.some(t=>!n(t)):n(t))}function R(t,n,e){return null!=n&&e.forEach((function(e){n.hasOwnProperty(e)&&(t[e]=n[e])})),t}function U(){}function G(t,n){const e=r.a.get(t);return"enable"===e||"disable"!==e&&"enable"===n}function F(t,n){return void 0===n?t:null===n?null==t?n:t:"object"!=typeof t||"object"!=typeof n?n:(Object.keys(n).forEach(e=>{const r=t[e],o=n[e];Array.isArray(r)&&Array.isArray(o)?t[e]=r.concat(o):t[e]="object"==typeof r&&"object"==typeof o?F(Object.assign({},r),o):o}),t)}function J(t){return t&&"object"==typeof t?JSON.parse(JSON.stringify(t)):t}function X(t,n){let e=255,r=255,o=255;const c=n||1,u=[];if(("string"!=typeof t||4!==t.length&&7!==t.length)&&u.push("Invalid hex color value: "+t),("number"!=typeof c||c<0||c>1)&&u.push("Invalid opacity value: "+c),u.length)throw new Error("Error converting value to RGB: "+u.join(", "));return 4===t.length&&(e=parseInt(t[1]+t[1],16),o=parseInt(t[2]+t[2],16),r=parseInt(t[3]+t[3],16)),7===t.length&&(e=parseInt(t[1]+t[2],16),o=parseInt(t[3]+t[4],16),r=parseInt(t[5]+t[6],16)),`rgba(${e},${o},${r},${c})`}function Y(t){return new Promise(n=>setTimeout(n,t))}const q=(t,n)=>null==t?n:t;function H(){return new Promise(t=>{!function n(){document.body?t():setTimeout(n,5)}()})}const W=()=>{var t,n;return Boolean("browsingTopics"in document&&(null===(t=document.featurePolicy)||void 0===t||null===(n=t.allowsFeature)||void 0===n?void 0:n.call(t,"browsing-topics")))},V=async()=>{if("cookieDeprecationLabel"in navigator)try{return await navigator.cookieDeprecationLabel.getValue()}catch{return null}return null},z=()=>{var t,n,e,r;return Boolean("joinAdInterestGroup"in navigator&&(null===(t=document.featurePolicy)||void 0===t||null===(n=t.allowsFeature)||void 0===n?void 0:n.call(t,"join-ad-interest-group"))&&(null===(e=document.featurePolicy)||void 0===e||null===(r=e.allowsFeature)||void 0===r?void 0:r.call(e,"run-ad-auction")))}},6:function(t,n,e){"use strict";e.d(n,"a",(function(){return o}));var r=e(48);function o(t,n){Object.defineProperty(r.a,t,{value:n,configurable:!1,enumerable:!0,writable:!1})}}}]);