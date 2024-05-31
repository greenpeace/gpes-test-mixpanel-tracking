/* jshint browser: true, esversion: 6 */
/* global URLSearchParams, jQuery, cookieTrackingManager, trackingScripts, gtag */

const cookieManageUI = {

    /**
     * Open the initial screen both on the B and C variants. Enables event listners
     * @param {string} nameWariant Name of the AB test variant
     */
    open1stBox: function () {

        jQuery("#cookiePromptCenter").modal({
            backdrop: 'static'
        });
        jQuery("#cookiePromptCenterDialog1").css("display", "block");              
 
        jQuery("#cookiePromptCenter [data-cookieResponse=accept]").on("click", function () {
            cookieManageUI.close1stBox(1);
            cookieTrackingManager.consent.allowAll = true;
            delete(cookieTrackingManager.consent.denyAll);
            cookieTrackingManager.write();
            trackingScripts.initAll();

            window.dispatchEvent(new CustomEvent("cookies:accept", {}));

            gtag('event', 'Click', {
                'event_label': 'Accept',
                'event_category': 'CookiePrivacy',
                'cookie_consent' : getConsentString(),
                'non_interaction': true
            });
        });

        jQuery("#cookiePromptCenter [data-cookieResponse=config]").on("click", function () {
            cookieManageUI.close1stBox();
            cookieManageUI.openSettingsBox();
            gtag('event', 'Click', {
                'event_label': 'Config',
                'event_category': 'CookiePrivacy',
                'cookie_consent' : getConsentString(),
                'non_interaction': true
            });
        });

        jQuery("#cookiePromptCenter [data-cookieResponse=check_policy]").on("click", function () {
            gtag('event', 'Click', {
                'event_label': 'Check Policy',
                'event_category': 'CookiePrivacy',
                'cookie_consent' : getConsentString(),
                'non_interaction': true
            });
        });

    },

    close1stBox: function () {

            jQuery("#cookiePromptCenter").modal("hide");

    },

    openSettingsBox: function () {
        
        jQuery("#cookiePromptSettings").css("display", "block");
        
            setTimeout(function () {
                jQuery("#cookiePrivacySettings").modal({
                    backdrop: 'static'
                });
            }, 500);

        jQuery("#cookiePrivacySettings [data-cookieResponse=accept_all]").on("click", function () {
            cookieManageUI.closeSettingsBox();
            cookieTrackingManager.consent.allowAll = true;
            delete(cookieTrackingManager.consent.denyAll);
            cookieTrackingManager.write();
            trackingScripts.initAll();

            window.dispatchEvent(new CustomEvent("cookies:acceptall", {}));

            gtag('event', 'Click', {
                'event_label': 'Accept all',
                'event_category': 'CookiePrivacy',
                'cookie_consent' : getConsentString(),
                'non_interaction': true
            });
        });

        jQuery("#cookiePrivacySettings [data-cookieResponse=deny_all]").on("click", function () {
            cookieManageUI.closeSettingsBox();
            cookieTrackingManager.consent.denyAll = true;
            delete(cookieTrackingManager.consent.allowAll);
            cookieTrackingManager.erraseAll(); 
            // cookieTrackingManager.write(); // Allready in erraseAll()
            trackingScripts.initAll();
            gtag('event', 'Click', {
                'event_label': 'Deny all',
                'event_category': 'CookiePrivacy',
                'cookie_consent' : getConsentString(),
                'non_interaction': true
            });
        });

        jQuery("#cookiePrivacySettings [data-cookieResponse=OK]").on("click", function () {
            cookieManageUI.closeSettingsBox();
            cookieTrackingManager.consent.cats = {};
            cookieTrackingManager.consent.cats.analytics = jQuery("#cookiesAnalitics").prop("checked");
            cookieTrackingManager.consent.cats.segmentation = jQuery("#cookiesSegmentation").prop("checked");
            cookieTrackingManager.consent.cats.advertisement = jQuery("#cookiesAdvertisement").prop("checked");
            cookieTrackingManager.write();
            trackingScripts.initAll();

            if ( cookieTrackingManager.consent.cats.analytics ){
                window.dispatchEvent(new CustomEvent("cookies:ok", {}));
            }
    
            gtag('event', 'Click', {
                'event_label': 'OK ' + String(cookieTrackingManager.consent.cats.analytics) + "," + String(cookieTrackingManager.consent.cats.segmentation) + "," + String(cookieTrackingManager.consent.cats.advertisement) ,
                'event_category': 'CookiePrivacy',
                'cookie_consent' : getConsentString(),
                'non_interaction': true
            });
        });

        jQuery("#cookiePrivacySettings [data-cookieResponse=check_policy]").on("click", function () {
            gtag('event', 'Click', {
                'event_label': 'Check Policy Settings' ,
                'event_category': 'CookiePrivacy',
                'cookie_consent' : getConsentString(),
                'non_interaction': true
            });
            
        });

    },

    closeSettingsBox: function () {
        jQuery("#cookiePrivacySettings").modal('hide');
    }

};
