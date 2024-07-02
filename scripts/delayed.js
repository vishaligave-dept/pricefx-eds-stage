/* eslint-disable func-names */
// eslint-disable-next-line import/no-cycle
/* eslint-disable no-undef */
import { sampleRUM } from './aem.js';
import { environmentMode } from './global-functions.js';

// Core Web Vitals RUM collection
sampleRUM('cwv');

// MARKETO SANDBOX INTEGRATION SCRIPT
const mktoSandboxIntegration = () => {
  let didInit = false;
  const initMunchkin = () => {
    if (didInit === false) {
      didInit = true;
      Munchkin.init('542-QYC-710');
    }
  };
  const s = document.createElement('script');
  s.type = 'text/javascript';
  s.async = true;
  s.src = '//munchkin.marketo.net/munchkin.js';
  s.onreadystatechange = () => {
    if (this.readyState === 'complete' || this.readyState === 'loaded') {
      initMunchkin();
    }
  };
  s.onload = initMunchkin;
  document.getElementsByTagName('head')[0].appendChild(s);
};
mktoSandboxIntegration();

// MARKETO PRODUCTION INTEGRATION SCRIPT
const mktoProdIntegration = () => {
  let didInit = false;
  function initMunchkin() {
    if (didInit === false) {
      didInit = true;
      Munchkin.init('289-DOX-852');
    }
  }
  const s = document.createElement('script');
  s.type = 'text/javascript';
  s.async = true;
  s.src = '//munchkin.marketo.net/munchkin-beta.js';
  s.onreadystatechange = function () {
    if (this.readyState === 'complete' || this.readyState === 'loaded') {
      initMunchkin();
    }
  };
  s.onload = initMunchkin;
  document.getElementsByTagName('head')[0].appendChild(s);
};

// add more delayed functionality here

// Load Drift Widget
function loadDriftChatWidget() {
  const driftChatWidget = document.createRange().createContextualFragment(`
        <!-- Start of Async Drift Code -->
        <script>
            "use strict";
            !function() {
            var t = window.driftt = window.drift = window.driftt || [];
            if (!t.init) {
                if (t.invoked) return void (window.console && console.error && console.error("Drift snippet included twice."));
                t.invoked = !0, t.methods = [ "identify", "config", "track", "reset", "debug", "show", "ping", "page", "hide", "off", "on" ], 
                t.factory = function(e) {
                return function() {
                    var n = Array.prototype.slice.call(arguments);
                    return n.unshift(e), t.push(n), t;
                };
                }, t.methods.forEach(function(e) {
                t[e] = t.factory(e);
                }), t.load = function(t) {
                var e = 3e5, n = Math.ceil(new Date() / e) * e, o = document.createElement("script");
                o.type = "text/javascript", o.async = !0, o.crossorigin = "anonymous", o.src = "https://js.driftt.com/include/" + n + "/" + t + ".js";
                var i = document.getElementsByTagName("script")[0];
                i.parentNode.insertBefore(o, i);
                };
            }
            }();
            drift.SNIPPET_VERSION = '0.3.1';
            drift.load('69rfc67t5vkt');
        </script>
        <!-- End of Async Drift Code -->
    `);
  document.head.append(driftChatWidget);
}

function dirftChatEventListener() {
  const chatWidgetEvents = document.createRange().createContextualFragment(`
        <!-- Start of Drift Events -->
        <script type="text/javascript">
            (function() {
                /* Add this class to any elements you want to use to open Drift.
                *
                * Examples:
                * - <a class="drift-open-chat">Questions? We're here to help!</a>
                * - <button class="drift-open-chat">Chat now!</button>
                *
                * You can have any additional classes on those elements that you
                * would like.
                */
                var DRIFT_CHAT_SELECTOR = '[href*="#chatwithus"]'
                /* http://youmightnotneedjquery.com/#ready */
                function ready(fn) {
                    if (document.readyState != 'loading') {
                    fn();
                    } else if (document.addEventListener) {
                    document.addEventListener('DOMContentLoaded', fn);
                    } else {
                    document.attachEvent('onreadystatechange', function() {
                        if (document.readyState != 'loading')
                        fn();
                    });
                    }
                }
                /* http://youmightnotneedjquery.com/#each */
                function forEachElement(selector, fn) {
                    var elements = document.querySelectorAll(selector);
                    for (var i = 0; i < elements.length; i++)
                    fn(elements[i], i);
                }
                function openChat(driftApi, event) {
                    event.preventDefault();
                    driftApi.openChat();
                    return false;
                }
                ready(function() {
                    drift.on('ready', function(api) {
                    var handleClick = openChat.bind(this, api)
                    forEachElement(DRIFT_CHAT_SELECTOR, function(el) {
                        el.addEventListener('click', handleClick);
                    });
                    });
                });
            })();
        </script>
        <!-- End of Drift Events -->
    `);
  document.head.append(chatWidgetEvents);
}

// Google tag manager
function loadGTM() {
  const scriptTag = document.createElement('script');
  if (window.location.hostname.includes('pricefx.com')) {
    // Live GTM
    scriptTag.innerHTML = `
    // Google Tag Manager
    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl+ '&gtm_auth=_SvHD1Iq6OnKV7OhtoDPLw&gtm_preview=env-2&gtm_cookies_win=x';f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','GTM-PXDNMZ7');`;
  } else {
    // Dev GTM
    scriptTag.innerHTML = `
    // Google Tag Manager
    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
     new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
     j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
     'https://www.googletagmanager.com/gtm.js?id='+i+dl+ '&gtm_auth=BiAH_CzfSizwS7DgUhlD8A&gtm_preview=env-169&gtm_cookies_win=x';f.parentNode.insertBefore(j,f);
     })(window,document,'script','dataLayer','GTM-PXDNMZ7');`;
  }
  document.head.prepend(scriptTag);
}

if (!window.location.hostname.includes('localhost') && environmentMode() === 'publish') {
  // Load GTM
  loadGTM();

  // Load Marketo
  mktoProdIntegration();

  // Load Drift Chat Widget & Events
  loadDriftChatWidget();
  dirftChatEventListener();
}
