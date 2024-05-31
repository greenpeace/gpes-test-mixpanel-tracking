# Test the integration methods between es.greenpeace.org and Mixpanel

 * [Preview site](https://greenpeace.github.io/gpes-test-mixpanel-tracking/) - Please open the preview site with a private window to view the cookie banner and to see the cookies without residual cookies.
  

## Relevant files

- The html files are to test and insert html if needed
- `cookieTrackingManager-2.js` - The tracking manager utilities
- `cookieManageUI-2.js` - The UI for accepting cookie tracking
- `stats-footer-testing-2.js` - The general file used in the entire site


## Functions to test if we can track, specially if it will add a cookie

They test each of the cookie categories and take into account the allow all and deny all cookies.

```javascript
cookieTrackingManager.canItrack("analytics")

cookieTrackingManager.canItrack("segmentation")

cookieTrackingManager.canItrack("advertisement")
```

This function is to check if the user has already given consent. And it's run with the DOMContentLoaded event.

```javascript
cookieTrackingManager.needToAskConsent()
```

If the user has given consent, the tracking starts immediately by running the function `trackingScripts.initAll();`.

If the user hasn't given consent the function `cookieManageUI.open1stBox(window.ABtestCookieVariant);` will be called and the consent window opens immediately.

The UI, after storing the cookies preferences will also call `trackingScripts.initAll();`


## DOM events when the user interacts with the cookie banner

Currently this window events are triggered from the ui. Any of the 3 DOM events mean that there's an update to the cookie permissions.

(it should not create a new page view, after acceptance)

- `cookies:accept`
- `cookies:acceptall`
- `cookies:ok`

## Google Analytics

Google Analytics tracks pagiews by using the consent mode. Because it can track without adding cookies, it works a little bit differently.

In the html head we have

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

But it's at the footer that we run the function to update consent.

That's `trackingScripts.googleAnalyticsFooter()`. This function runs `gtag('config', 'G-7NL9SM5MNP', googleTrackingConfig);`.

`googleTrackingConfig` is an object that includes information about the page. In the home page it hasn't many information but in pages like the [Arctic petition](https://es.greenpeace.org/es/que-puedes-hacer-tu/peticiones/el-artico-se-derrite/) it contains more information.
