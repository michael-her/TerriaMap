'use strict';

/*global require,window */

var terriaOptions = {
    baseUrl: 'build/TerriaJS',
};

// checkBrowserCompatibility('ui');
import GoogleAnalytics from 'terriajs/lib/Core/GoogleAnalytics';
import ShareDataService from 'terriajs/lib/Models/ShareDataService';
import raiseErrorToUser from 'terriajs/lib/Models/raiseErrorToUser';
import registerAnalytics from 'terriajs/lib/Models/registerAnalytics';
import registerCatalogMembers from 'terriajs/lib/Models/registerCatalogMembers';
import registerCustomComponentTypes from 'terriajs/lib/ReactViews/Custom/registerCustomComponentTypes';
import Terria from 'terriajs/lib/Models/Terria';
import updateApplicationOnHashChange from 'terriajs/lib/ViewModels/updateApplicationOnHashChange';
import updateApplicationOnMessageFromParentWindow from 'terriajs/lib/ViewModels/updateApplicationOnMessageFromParentWindow';
import ViewState from 'terriajs/lib/ReactViewModels/ViewState';
import BingMapsSearchProviderViewModel from 'terriajs/lib/ViewModels/BingMapsSearchProviderViewModel.js';
import GazetteerSearchProviderViewModel from 'terriajs/lib/ViewModels/GazetteerSearchProviderViewModel.js';
import GnafSearchProviderViewModel from 'terriajs/lib/ViewModels/GnafSearchProviderViewModel.js';
import defined from 'terriajs-cesium/Source/Core/defined';
import render from './lib/Views/render';
import store from './lib/Views/store'
// import 'terriajs/lib/Core/knockout.mapping'

// michael

// import {SwaggerUIBundle} from 'swagger-ui-dist';
// import "css-loader!swagger-ui-react/swagger-ui.css"
// import "swagger-ui/swagger-ui.css"

// import swaggerSpec from 'js-yaml-loader!./lib/Docs/swagger-config.yaml';

// import swaggerSpec from './lib/Docs/swagger-config.json';
// import SwaggerUI from "swagger-ui"
// SwaggerUI({
//   // url: "https://petstore.swagger.io/v2/swagger.json",
//   dom_id: '#swagger-ui',
//   // presets: [
//   //   SwaggerUIBundle.presets.apis,
//   //   SwaggerUIBundle.SwaggerUIStandalonePreset
//   // ],
//   spec: swaggerSpec,
//   // layout: "StandaloneLayout"
// })

// i18n 한국어
import i18next from 'i18next';
import translationKr from './lib/Language/ko-KR/translation.json';

i18next.addResourceBundle('ko-KR', 'translation', translationKr, true, true);

// Register all types of catalog members in the core TerriaJS.  If you only want to register a subset of them
// (i.e. to reduce the size of your application if you don't actually use them all), feel free to copy a subset of
// the code in the registerCatalogMembers function here instead.
registerCatalogMembers();

registerAnalytics();

terriaOptions.analytics = new GoogleAnalytics();

terriaOptions.store = store;

// Construct the TerriaJS application, arrange to show errors to the user, and start it up.
var terria = new Terria(terriaOptions);

// Register custom components in the core TerriaJS.  If you only want to register a subset of them, or to add your own,
// insert your custom version of the code in the registerCustomComponentTypes function here instead.
registerCustomComponentTypes(terria);

// Create the ViewState before terria.start so that errors have somewhere to go.
const viewState = new ViewState({
    terria: terria
});

if (process.env.NODE_ENV === "development") {
    window.viewState = viewState;
}

// If we're running in dev mode, disable the built style sheet as we'll be using the webpack style loader.
// Note that if the first stylesheet stops being nationalmap.css then this will have to change.
if (process.env.NODE_ENV !== "production" && module.hot) {
    document.styleSheets[0].disabled = true;
}

module.exports = terria.start({
    // If you don't want the user to be able to control catalog loading via the URL, remove the applicationUrl property below
    // as well as the call to "updateApplicationOnHashChange" further down.
    applicationUrl: window.location,
    configUrl: 'config.json',
    defaultTo2D: true,
    shareDataService: new ShareDataService({
        terria: terria
    })
}).otherwise(function(e) {
    raiseErrorToUser(terria, e);
}).always(function() {
    try {
        viewState.searchState.locationSearchProviders = [
            new BingMapsSearchProviderViewModel({
                terria: terria,
                key: terria.configParameters.bingMapsKey
            }),
            new GazetteerSearchProviderViewModel({terria}),
            new GnafSearchProviderViewModel({terria})
        ];

        // Automatically update Terria (load new catalogs, etc.) when the hash part of the URL changes.
        updateApplicationOnHashChange(terria, window);
        // TerriaJS can be configured to accept messages posted to it by its parent window.
        // This is useful when embedding a TerriaJS app in an iframe and when the parent wants to send more data to the embedded app
        // than can be reasonably included in a URL.
        updateApplicationOnMessageFromParentWindow(terria, window);

        // Create the various base map options.
        var createKoreanBaseMapOptions = require('terriajs/lib/ViewModels/createKoreanBaseMapOptions');
        var createGlobalBaseMapOptions = require('terriajs/lib/ViewModels/createGlobalBaseMapOptions');
        var selectBaseMap = require('terriajs/lib/ViewModels/selectBaseMap');

        // michael
        var koreanBaseMaps = createKoreanBaseMapOptions(terria);
        var globalBaseMaps = createGlobalBaseMapOptions(terria, terria.configParameters.bingMapsKey);

        var allBaseMaps = koreanBaseMaps.concat(globalBaseMaps);
        selectBaseMap(terria, allBaseMaps, 'Dark Matter' /*'Bing Maps Aerial with Labels'*/, true);

        // Show a modal disclaimer before user can do anything else.
        if (defined(terria.configParameters.globalDisclaimer)) {
            var globalDisclaimer = terria.configParameters.globalDisclaimer;
            var hostname = window.location.hostname;
            if (globalDisclaimer.enableOnLocalhost || hostname.indexOf('localhost') === -1) {
                var message = '';
                // Sometimes we want to show a preamble if the user is viewing a site other than the official production instance.
                // This can be expressed as a devHostRegex ("any site starting with staging.") or a negative prodHostRegex ("any site not ending in .gov.au")
                if (defined(globalDisclaimer.devHostRegex) && hostname.match(globalDisclaimer.devHostRegex) ||
                    defined(globalDisclaimer.prodHostRegex) && !hostname.match(globalDisclaimer.prodHostRegex)) {
                        message += require('./lib/Views/DevelopmentDisclaimerPreamble.html');
                }
                message += require('./lib/Views/GlobalDisclaimer.html');

                var options = {
                    title: (globalDisclaimer.title !== undefined) ? globalDisclaimer.title : 'Warning',
                    confirmText: (globalDisclaimer.buttonTitle || "Ok"),
                    width: 600,
                    height: 550,
                    message: message,
                    horizontalPadding : 100
                };
                viewState.notifications.push(options);
            }
        }

        // Update the ViewState based on Terria config parameters.
        // Note: won't do anything unless terriajs version is >7.9.0
        if (defined(viewState.afterTerriaStarted)) {
            viewState.afterTerriaStarted();
        }

        render(terria, allBaseMaps, viewState);
    } catch (e) {
        console.error(e);
        console.error(e.stack);
    }
});
