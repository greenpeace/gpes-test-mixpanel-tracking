# Test the integration methods between es.greenpeace.org and Mixpanel

**Testing the basic assumptions:**
* [Preview site in Github](https://greenpeace.github.io/gpes-test-mixpanel-tracking/) - Please open the preview site with a private window to view the cookie banner and to see the cookies without residual cookies from other sites.
* **[Preview site in greenpeace.es](https://static.greenpeace.es/test-mixpanel/)** - Preview site on a greenpeace.es subdomain, the same domain as the tag manager. Please note that the "hazte-socio" links can be used to test nav between pages.
* **Sandbox:**
  * [Simple tracking demo](https://greenpeace.github.io/gpes-test-mixpanel-tracking/sandbox/simple-client-side-tracking.html) - Testing client side tracking.
  * [Simple tracking with proxy demo](https://greenpeace.github.io/gpes-test-mixpanel-tracking/sandbox/simple-client-side-tracking-with-proxy.html) - Testing client side tracking with proxy.
  * [Client side GTM with custom loader](https://static.greenpeace.es/test-gtm-loader/) - [source code](sandbox/client-side-tag-manager-with-custom-loader.html).
* **Mixpanel:**
  * [Mixpanel backend](https://eu.mixpanel.com/project/3304788/view/3810100/app/events) - Latest events in the **test account**.
  * [Google Analytics account](https://analytics.google.com/analytics/web/#/p446051450/realtime/overview?params=_u..nav%3Dmaui) - We've created this account to confirm that 100% of the events are being sent just to Mixpanel and not to GA4.
* **Chrome extensions:**
  * [Mixpanel extension](https://chromewebstore.google.com/detail/mixpanel-tools/eifepbfdgonblafppielmnnihcopdlpo) - Easily inspect events and properties.
* **Google Tag Manager:**
  * [Web test container](https://tagmanager.google.com/#/container/accounts/553476035/containers/2723648/) - Client side only.
  * [GPES Test client](https://tagmanager.google.com/#/container/accounts/553476035/containers/187017593/)
  * [GPES Test server](https://tagmanager.google.com/#/container/accounts/553476035/containers/187038479/)

## Goals of this test

1. Respect the **cookie law** by:
   1. Don't put any cookie, that could be used for tracking, before the user makes a decision about cookies.
   2. If the user denies all cookies, the only cookie allowed is the local storage object `cookieSettings` with info about the user's choice.
   3. If the user has taken a **decision about cookies before the implementation of Mixpanel**, respect that decision.
   4. Respect the 2 relevant **cookie categories**: "analytics" for anonymous tracking and with "segmentation" we can relate with PII.
2. Set up the **identity** properly to use with:
   1. Anonymous users that have **rejected cookies** on events in the same page (page view and others)
   2. Anonymous users that have **accepted cookies**. The identity will have to be consistent between pages and between sessions.
   3. **Users identified by email** (forms) should merge their new non-anonymous identity with previous ones. Only if the user has accepted the `segmentation` category. And the email has to be encrypted (hashed).
   4. **Merge new email hash** to an identity that already has an email address.
3. Mixpanel should collect information with **Brave's browser** and it's default settings. The user's cookie decisions for this website have to override Brave's settings.
4. **Test potential technologies**, like GTM server side, proxies...
5. Compatible with ourcurrent and future **cache systems**. PHP is not run on each pageview. Currently we have a 2<sup>?</sup> minute cache.

<sup><sub>Note: Above, when say "cookie", it includes any tech that can store information in the user's browser.</sub></sup>


## Relevant files

- The **html** files in this repository are used to test and insert html if needed. Each represent a content type, and for now only the home page was added.
- `cookieTrackingManager-2.js` - The cookie management utilities, used by all scripts that use non-essencial cookies.
- `cookieManageUI-2.js` - The UI for accepting / rejecting cookie categories. (Micro-sites in es.greenpeace.org use a different code for the UI.)
- `stats-footer-testing-2.js` - The general file used in the entire site to manage tracking accordingly to the user cookie preferences.

<sup><sub>**Note:** we don't use non-javascript tracking if we can't respect the user's choice about cookies.</sub></sup>


## Functions to test if we can track, specially if it will add a cookie

The following function is used to check if the user has already given or denied consent. And it runs after the `DOMContentLoaded` DOM event.

```javascript
cookieTrackingManager.needToAskConsent()
```

This functions test each of the cookie categories and also take into account the allow all and deny all cookies actions. They return a boolean and should be run to test if a tracking action can be peformed.

```javascript
cookieTrackingManager.canItrack("analytics")

cookieTrackingManager.canItrack("segmentation")

cookieTrackingManager.canItrack("advertisement")
```

- If the user has given consent, the tracking starts immediately by running the function `trackingScripts.initAll();`.
- If the user hasn't given consent the function `cookieManageUI.open1stBox(window.ABtestCookieVariant);` will be called and the consent window opens immediately.

The UI, after storing the cookies preferences will also call `trackingScripts.initAll();`


## DOM events when the user interacts with the cookie banner

Currently this window events are triggered from the ui. Any of the 3 DOM events mean that there's an update to the cookie permissions.

- `cookies:accept`
- `cookies:acceptall`
- `cookies:ok`

Please note that this 3 events aren't currently listned to. They were created to handle 3rd party scripts, like for example GTM.

<small>If we use this events please note that the triggering of one of this events should not create a second pageview.</small>


## About how Google Analytics works

Google Analytics tracks page views by using consent mode. Because it can track without adding cookies, it works a little bit differently.

In the html head of the page we have:

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-VEG9B9WWG6"></script>
<script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('consent', 'default', {
        'ad_storage': 'denied', // V1
        'analytics_storage': 'denied', // V1
        'ad_user_data' : 'denied', // V2
        'ad_personalization':'denied' // V2
    });
    gtag('js', new Date());

    window.googleTrackingConfig = {
        'custom_map': {
            'dimension1': 'ExistingOrNew',
            'dimension2': 'CookiePrivacyVariant'
        }
    };
    if (window.performance) {
        document.addEventListener("DOMContentLoaded", function(event) {
            window.timeSinceDomLoaded = Math.round(performance.now());
        });
        window.addEventListener("load", function(event) {
            window.timeSinceEventLoad = Math.round(performance.now());
        });
    }
</script>
```

But it's at the footer that we run the function to update consent and track the page view. That's `trackingScripts.googleAnalyticsFooter()`. This function runs `gtag('config', 'G-VEG9B9WWG6', googleTrackingConfig);`.

`googleTrackingConfig` is an object that includes **information about the page**. In the home page it hasn't many information but in pages like the [Arctic petition](https://es.greenpeace.org/es/que-puedes-hacer-tu/peticiones/el-artico-se-derrite/) or a [blog post page](https://es.greenpeace.org/es/noticias/urdaibai-ya-es-un-tesoro-el-guggenheim-no-va-aqui/) it contains more information.

For more information about our **Google Events and parameters** check our [Gitbook page](https://app.gitbook.com/o/-LMm4Q4AuKcwl38JYrxF/s/njw6SING5MzUWFzMcygA/web/tracking-and-web-analytics/google-analytics-4-events-and-params).
