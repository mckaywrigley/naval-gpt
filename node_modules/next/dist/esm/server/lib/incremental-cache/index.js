import FileSystemCache from "./file-system-cache";
import path from "../../../shared/lib/isomorphic/path";
import { normalizePagePath } from "../../../shared/lib/page-path/normalize-page-path";
import FetchCache from "./fetch-cache";
function toRoute(pathname) {
    return pathname.replace(/\/$/, "").replace(/\/index$/, "") || "/";
}
export class CacheHandler {
    // eslint-disable-next-line
    constructor(_ctx){}
    async get(_key, _fetchCache) {
        return {};
    }
    async set(_key, _data, _fetchCache) {}
}
export class IncrementalCache {
    constructor({ fs , dev , appDir , flushToDisk , fetchCache , minimalMode , serverDistDir , requestHeaders , maxMemoryCacheSize , getPrerenderManifest , fetchCacheKeyPrefix , CurCacheHandler  }){
        if (!CurCacheHandler) {
            if (fs && serverDistDir) {
                CurCacheHandler = FileSystemCache;
            }
            if (minimalMode && fetchCache) {
                CurCacheHandler = FetchCache;
            }
        }
        if (process.env.__NEXT_TEST_MAX_ISR_CACHE) {
            // Allow cache size to be overridden for testing purposes
            maxMemoryCacheSize = parseInt(process.env.__NEXT_TEST_MAX_ISR_CACHE, 10);
        }
        this.dev = dev;
        this.minimalMode = minimalMode;
        this.requestHeaders = requestHeaders;
        this.prerenderManifest = getPrerenderManifest();
        if (CurCacheHandler) {
            this.cacheHandler = new CurCacheHandler({
                dev,
                fs,
                flushToDisk,
                serverDistDir,
                maxMemoryCacheSize,
                _appDir: !!appDir,
                _requestHeaders: requestHeaders,
                fetchCacheKeyPrefix
            });
        }
    }
    calculateRevalidate(pathname, fromTime, dev) {
        // in development we don't have a prerender-manifest
        // and default to always revalidating to allow easier debugging
        if (dev) return new Date().getTime() - 1000;
        // if an entry isn't present in routes we fallback to a default
        // of revalidating after 1 second
        const { initialRevalidateSeconds  } = this.prerenderManifest.routes[toRoute(pathname)] || {
            initialRevalidateSeconds: 1
        };
        const revalidateAfter = typeof initialRevalidateSeconds === "number" ? initialRevalidateSeconds * 1000 + fromTime : initialRevalidateSeconds;
        return revalidateAfter;
    }
    _getPathname(pathname, fetchCache) {
        return fetchCache ? pathname : normalizePagePath(pathname);
    }
    // x-ref: https://github.com/facebook/react/blob/2655c9354d8e1c54ba888444220f63e836925caa/packages/react/src/ReactFetch.js#L23
    async fetchCacheKey(url, init = {}) {
        const cacheString = JSON.stringify([
            this.fetchCacheKey || "",
            url,
            init.method,
            init.headers,
            init.mode,
            init.redirect,
            init.credentials,
            init.referrer,
            init.referrerPolicy,
            init.integrity,
            init.next,
            init.cache, 
        ]);
        let cacheKey;
        if (process.env.NEXT_RUNTIME === "edge") {
            function bufferToHex(buffer) {
                return Array.prototype.map.call(new Uint8Array(buffer), (b)=>b.toString(16).padStart(2, "0")).join("");
            }
            const buffer1 = new TextEncoder().encode(cacheString);
            cacheKey = bufferToHex(await crypto.subtle.digest("SHA-256", buffer1));
        } else {
            const crypto = require("crypto");
            cacheKey = crypto.createHash("sha256").update(cacheString).digest("hex");
        }
        return cacheKey;
    }
    // get data from cache if available
    async get(pathname, fetchCache) {
        var ref, ref1, ref2;
        // we don't leverage the prerender cache in dev mode
        // so that getStaticProps is always called for easier debugging
        if (this.dev && (!fetchCache || this.requestHeaders["cache-control"] === "no-cache")) {
            return null;
        }
        pathname = this._getPathname(pathname, fetchCache);
        let entry = null;
        const cacheData = await ((ref = this.cacheHandler) == null ? void 0 : ref.get(pathname, fetchCache));
        if ((cacheData == null ? void 0 : (ref1 = cacheData.value) == null ? void 0 : ref1.kind) === "FETCH") {
            const revalidate = cacheData.value.revalidate;
            const age = Math.round((Date.now() - (cacheData.lastModified || 0)) / 1000);
            const isStale = age > revalidate;
            const data = cacheData.value.data;
            return {
                isStale: isStale,
                value: {
                    kind: "FETCH",
                    data,
                    revalidate: revalidate
                },
                revalidateAfter: (cacheData.lastModified || Date.now()) + revalidate * 1000
            };
        }
        const curRevalidate = (ref2 = this.prerenderManifest.routes[toRoute(pathname)]) == null ? void 0 : ref2.initialRevalidateSeconds;
        const revalidateAfter = this.calculateRevalidate(pathname, (cacheData == null ? void 0 : cacheData.lastModified) || Date.now(), this.dev && !fetchCache);
        const isStale = revalidateAfter !== false && revalidateAfter < Date.now() ? true : undefined;
        if (cacheData) {
            entry = {
                isStale,
                curRevalidate,
                revalidateAfter,
                value: cacheData.value
            };
        }
        if (!cacheData && this.prerenderManifest.notFoundRoutes.includes(pathname)) {
            // for the first hit after starting the server the cache
            // may not have a way to save notFound: true so if
            // the prerender-manifest marks this as notFound then we
            // return that entry and trigger a cache set to give it a
            // chance to update in-memory entries
            entry = {
                isStale,
                value: null,
                curRevalidate,
                revalidateAfter
            };
            this.set(pathname, entry.value, curRevalidate, fetchCache);
        }
        return entry;
    }
    // populate the incremental cache with new data
    async set(pathname, data, revalidateSeconds, fetchCache) {
        if (this.dev && !fetchCache) return;
        // fetchCache has upper limit of 1MB per-entry currently
        if (fetchCache && JSON.stringify(data).length > 1024 * 1024) {
            if (this.dev) {
                throw new Error(`fetch for over 1MB of data can not be cached`);
            }
            return;
        }
        pathname = this._getPathname(pathname, fetchCache);
        try {
            var ref;
            // we use the prerender manifest memory instance
            // to store revalidate timings for calculating
            // revalidateAfter values so we update this on set
            if (typeof revalidateSeconds !== "undefined" && !fetchCache) {
                this.prerenderManifest.routes[pathname] = {
                    dataRoute: path.posix.join("/_next/data", `${normalizePagePath(pathname)}.json`),
                    srcRoute: null,
                    initialRevalidateSeconds: revalidateSeconds
                };
            }
            await ((ref = this.cacheHandler) == null ? void 0 : ref.set(pathname, data, fetchCache));
        } catch (error) {
            console.warn("Failed to update prerender cache for", pathname, error);
        }
    }
}

//# sourceMappingURL=index.js.map