"use client";
import _async_to_generator from "@swc/helpers/src/_async_to_generator.mjs";
import { createFromFetch } from 'next/dist/compiled/react-server-dom-webpack/client';
import { NEXT_ROUTER_PREFETCH, NEXT_ROUTER_STATE_TREE, RSC, RSC_CONTENT_TYPE_HEADER } from '../app-router-headers';
import { urlToUrlWithoutFlightMarker } from '../app-router';

/**
 * Fetch the flight data for the provided url. Takes in the current router state to decide what to render server-side.
 */ export function fetchServerResponse(url, flightRouterState, prefetch) {
    return _fetchServerResponse.apply(this, arguments);
}
function _fetchServerResponse() {
    _fetchServerResponse = _async_to_generator(function*(url, flightRouterState, prefetch) {
        const headers = {
            // Enable flight response
            [RSC]: '1',
            // Provide the current router state
            [NEXT_ROUTER_STATE_TREE]: JSON.stringify(flightRouterState)
        };
        if (prefetch) {
            // Enable prefetch response
            headers[NEXT_ROUTER_PREFETCH] = '1';
        }
        const res = yield fetch(url.toString(), {
            // Backwards compat for older browsers. `same-origin` is the default in modern browsers.
            credentials: 'same-origin',
            headers
        });
        const canonicalUrl = res.redirected ? urlToUrlWithoutFlightMarker(res.url) : undefined;
        const isFlightResponse = res.headers.get('content-type') === RSC_CONTENT_TYPE_HEADER;
        // If fetch returns something different than flight response handle it like a mpa navigation
        if (!isFlightResponse) {
            return [
                res.url,
                undefined
            ];
        }
        // Handle the `fetch` readable stream that can be unwrapped by `React.use`.
        const flightData = yield createFromFetch(Promise.resolve(res));
        return [
            flightData,
            canonicalUrl
        ];
    });
    return _fetchServerResponse.apply(this, arguments);
}

//# sourceMappingURL=fetch-server-response.js.map