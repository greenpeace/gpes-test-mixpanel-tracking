# Test the integration methods between es.greenpeace.org and Mixpanel


 * [Preview site](https://greenpeace.github.io/gpes-test-mixpanel-tracking/) - Please open the preview site with a private window to view the cookie banner and to see the cookies without residual cookies.


## Goals of this test

1. Respect the cookie law by:
   1. Don't put any cookie, that could be used for tracking, before the user makes a decision about cookies.
   2. If the user denies all cookies, the only cookie allowed is the local storage object `cookieSettings` with info about the user's choice.
   3. If the user has taken a decision about cookies before the implementation of Mixpanel, respect that decision.
   4. Respect the 2 relevant categories: "analytics" for anonymous tracking and with "segmentation" we can relate with PII.
2. Mixpanel should collect information with Brave's browser and it's default settings. The user cookie decisions for this website have to override Brave's.

<small>Note: Above, when say "coookie", it includes any tech that can store information in the user's browser.</small> 


## Relevant files

- The html files in this repository are used to test and insert html if needed.
- `cookieTrackingManager-2.js` - The cookie managament utilities.
- `cookieManageUI-2.js` - The UI for accepting cookie tracking. Microsites in es.greenpeace.org use a different code for the UI.
- `stats-footer-testing-2.js` - The general file used in the entire site to manage tracking accordingly to the user cookie preferences.

<small>Please note we don't use non-javascript tracking, as we can't respect the user's choice about cookies if we would use it.</small>


## Functions to test if we can track, specially if it will add a cookie

This function is to check if the user has already given or denied consent. And it's run with the `DOMContentLoaded` DOM event.

```javascript
cookieTrackingManager.needToAskConsent()
```

This functions test each of the cookie categories and also take into account the allow all and deny all cookies actions.

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

<small>If we use this events please note that the triggering of one of this events should not create a second pageview.</small>


## About how Google Analytics works

Google Analytics tracks pagiews by using the consent mode. Because it can track without adding cookies, it works a little bit differently.

In the html head of the page we have:

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-7NL9SM5MNP"></script>
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

But it's at the footer that we run the function to update consent and track the page view. That's `trackingScripts.googleAnalyticsFooter()`. This function runs `gtag('config', 'G-7NL9SM5MNP', googleTrackingConfig);`.

`googleTrackingConfig` is an object that includes **information about the page**. In the home page it hasn't many information but in pages like the [Arctic petition](https://es.greenpeace.org/es/que-puedes-hacer-tu/peticiones/el-artico-se-derrite/) or a [blog post page](https://es.greenpeace.org/es/noticias/urdaibai-ya-es-un-tesoro-el-guggenheim-no-va-aqui/) it contains more information.

For more information about our **Google Events and parameters** check our [Gitbook page](https://app.gitbook.com/o/-LMm4Q4AuKcwl38JYrxF/s/njw6SING5MzUWFzMcygA/web/tracking-and-web-analytics/google-analytics-4-events-and-params).
