# Test the integration methods between es.greenpeace.org and Mixpanel

 * [Preview site](https://greenpeace.github.io/gpes-test-mixpanel-tracking/)
  

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

## DOM events when the user interacts with the cookie banner

Currently this window events are triggered from the ui. Any of the 3 DOM events mean that there's an update to the cookie permissions.

(it should not create a new page view, after acceptance)

- `cookies:accept`
- `cookies:acceptall`
- `cookies:ok`


