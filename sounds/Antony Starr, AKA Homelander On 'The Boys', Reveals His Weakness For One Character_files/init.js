window.OneSignal = window.OneSignal || [];
var oneSignalConfig = oneSignalConfig || {};

OneSignal.push( function() {

    OneSignal.SERVICE_WORKER_UPDATER_PATH = oneSignalConfig.service_worker_updater_path;
    OneSignal.SERVICE_WORKER_PATH         = oneSignalConfig.service_worker_path;
    OneSignal.SERVICE_WORKER_PARAM        = { scope: oneSignalConfig.service_worker_scope };

    OneSignal.setDefaultNotificationUrl( oneSignalConfig.default_url );

    var oneSignal_options = oneSignalConfig.initOptions || {};

    // Display predicate.
    if ( oneSignal_options.displayPredicate ) {

        oneSignal_options.displayPredicate = function() {
            return OneSignal.isPushNotificationsEnabled()
            .then(
                function( isPushEnabled ) {
                    return !isPushEnabled;
                }
            );
        };
    }

    window._oneSignalInitOptions = oneSignal_options;

    // Initialize OneSignal only if configured.
    if ( oneSignalConfig.should_initialize_sdk ) {

        OneSignal.init( window._oneSignalInitOptions );
    }

    // Whether to prompt auto register prompt or not.
    if ( oneSignalConfig.should_prompt_auto_register ) {

        OneSignal.showSlidedownPrompt();
    }

    // Whether to use native prompt.
    if ( oneSignalConfig.should_use_native_prompt ) {

        OneSignal.showNativePrompt();
    }
});

function documentInitOneSignal() {

    var oneSignal_elements = document.getElementsByClassName("OneSignal-prompt");

    var oneSignalLinkClickHandler = function( event ) {

        if ( oneSignalConfig.should_use_modal_prompt ) {
            OneSignal.push( ['registerForPushNotifications', { modalPrompt: true } ] );
        } else {
            OneSignal.push( ['registerForPushNotifications'] );
        }

        event.preventDefault();
    };

    for( var i = 0; i < oneSignal_elements.length; i++ ) {
        oneSignal_elements[i].addEventListener('click', oneSignalLinkClickHandler, false);
    }
}

if ( 'complete' === document.readyState ) {

    documentInitOneSignal();
} else {

    window.addEventListener( "load", function( event ) {
        documentInitOneSignal();
    });
}

window.addEventListener( "load", function( event ) {
    // Whether to use PMC's Custom Initialization.
    if ( oneSignalConfig.should_use_pmc_custom_sdk_init ) {

        var promptOptions  = oneSignalConfig.initOptions.promptOptions;
        var pmcSlidedown   = {
            enabled: true,
            autoPrompt: true,
            timeDelay: 0,
            pageViews: 2,
        };
        var pmcInitOptions = {
            slidedown : pmcSlidedown
        };

        pmcSlidedown = Object.assign( pmcSlidedown, promptOptions );
        oneSignalConfig.initOptions.promptOptions = pmcInitOptions;

        window.OneSignal.push(function() {
            /* IMPORTANT: Never call init() more than once. An error will occur. */
            window.OneSignal.init(window._oneSignalInitOptions);
        });
    }
});
