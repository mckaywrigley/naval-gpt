"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.patchFetch = patchFetch;
var _constants = require("./trace/constants");
var _tracer = require("./trace/tracer");
var _constants1 = require("../../lib/constants");
const isEdgeRuntime = process.env.NEXT_RUNTIME === "edge";
function patchFetch({ serverHooks , staticGenerationAsyncStorage  }) {
    if (globalThis.fetch.patched) return;
    const { DynamicServerError  } = serverHooks;
    const originFetch = fetch;
    // @ts-expect-error - we're patching fetch
    // eslint-disable-next-line no-native-reassign
    fetch = (0, _tracer).getTracer().wrap(_constants.AppRenderSpan.fetch, {
        kind: _tracer.SpanKind.CLIENT
    }, async (input, init)=>{
        var ref, ref1, ref2;
        const staticGenerationStore = staticGenerationAsyncStorage.getStore();
        // If the staticGenerationStore is not available, we can't do any
        // special treatment of fetch, therefore fallback to the original
        // fetch implementation.
        if (!staticGenerationStore || ((ref = init == null ? void 0 : init.next) == null ? void 0 : ref.internal)) {
            return originFetch(input, init);
        }
        let revalidate = undefined;
        let curRevalidate = init == null ? void 0 : (ref1 = init.next) == null ? void 0 : ref1.revalidate;
        if ((init == null ? void 0 : init.cache) === "force-cache") {
            curRevalidate = false;
        }
        if ([
            "no-cache",
            "no-store"
        ].includes((init == null ? void 0 : init.cache) || "")) {
            curRevalidate = 0;
        }
        if (typeof curRevalidate === "number") {
            revalidate = curRevalidate;
        }
        if (curRevalidate === false) {
            revalidate = _constants1.CACHE_ONE_YEAR;
        }
        const initHeaders = typeof ((ref2 = init == null ? void 0 : init.headers) == null ? void 0 : ref2.get) === "function" ? init == null ? void 0 : init.headers : new Headers((init == null ? void 0 : init.headers) || {});
        const hasUnCacheableHeader = initHeaders.get("authorization") || initHeaders.get("cookie");
        if (typeof revalidate === "undefined") {
            // if there are uncacheable headers and the cache value
            // wasn't overridden then we must bail static generation
            if (hasUnCacheableHeader) {
                revalidate = 0;
            } else {
                revalidate = typeof staticGenerationStore.revalidate === "boolean" || typeof staticGenerationStore.revalidate === "undefined" ? _constants1.CACHE_ONE_YEAR : staticGenerationStore.revalidate;
            }
        }
        if (typeof staticGenerationStore.revalidate === "undefined" || typeof revalidate === "number" && revalidate < staticGenerationStore.revalidate) {
            staticGenerationStore.revalidate = revalidate;
        }
        let cacheKey;
        const doOriginalFetch = async ()=>{
            return originFetch(input, init).then(async (res)=>{
                if (staticGenerationStore.incrementalCache && cacheKey && typeof revalidate === "number" && revalidate > 0) {
                    const clonedRes = res.clone();
                    let base64Body = "";
                    if (process.env.NEXT_RUNTIME === "edge") {
                        let string = "";
                        new Uint8Array(await clonedRes.arrayBuffer()).forEach((byte)=>{
                            string += String.fromCharCode(byte);
                        });
                        base64Body = btoa(string);
                    } else {
                        base64Body = Buffer.from(await clonedRes.arrayBuffer()).toString("base64");
                    }
                    try {
                        await staticGenerationStore.incrementalCache.set(cacheKey, {
                            kind: "FETCH",
                            data: {
                                headers: Object.fromEntries(clonedRes.headers.entries()),
                                body: base64Body
                            },
                            revalidate
                        }, revalidate, true);
                    } catch (err) {
                        console.warn(`Failed to set fetch cache`, input, err);
                    }
                }
                return res;
            });
        };
        if (staticGenerationStore.incrementalCache && typeof revalidate === "number" && revalidate > 0) {
            cacheKey = await staticGenerationStore.incrementalCache.fetchCacheKey(input.toString(), init);
            const entry = await staticGenerationStore.incrementalCache.get(cacheKey, true);
            if ((entry == null ? void 0 : entry.value) && entry.value.kind === "FETCH") {
                // when stale and is revalidating we wait for fresh data
                // so the revalidated entry has the updated data
                if (!staticGenerationStore.isRevalidate || !entry.isStale) {
                    if (entry.isStale) {
                        if (!staticGenerationStore.pendingRevalidates) {
                            staticGenerationStore.pendingRevalidates = [];
                        }
                        staticGenerationStore.pendingRevalidates.push(doOriginalFetch().catch(console.error));
                    }
                    const resData = entry.value.data;
                    let decodedBody = "";
                    // TODO: handle non-text response bodies
                    if (process.env.NEXT_RUNTIME === "edge") {
                        decodedBody = atob(resData.body);
                    } else {
                        decodedBody = Buffer.from(resData.body, "base64").toString();
                    }
                    return new Response(decodedBody, {
                        headers: resData.headers,
                        status: resData.status
                    });
                }
            }
        }
        if (staticGenerationStore.isStaticGeneration) {
            if (init && typeof init === "object") {
                const cache = init.cache;
                // Delete `cache` property as Cloudflare Workers will throw an error
                if (isEdgeRuntime) {
                    delete init.cache;
                }
                if (cache === "no-store") {
                    staticGenerationStore.revalidate = 0;
                    // TODO: ensure this error isn't logged to the user
                    // seems it's slipping through currently
                    const dynamicUsageReason = `no-store fetch ${input}${staticGenerationStore.pathname ? ` ${staticGenerationStore.pathname}` : ""}`;
                    const err = new DynamicServerError(dynamicUsageReason);
                    staticGenerationStore.dynamicUsageStack = err.stack;
                    staticGenerationStore.dynamicUsageDescription = dynamicUsageReason;
                    throw err;
                }
                const hasNextConfig = "next" in init;
                const next = init.next || {};
                if (typeof next.revalidate === "number" && (typeof staticGenerationStore.revalidate === "undefined" || next.revalidate < staticGenerationStore.revalidate)) {
                    const forceDynamic = staticGenerationStore.forceDynamic;
                    if (!forceDynamic || next.revalidate !== 0) {
                        staticGenerationStore.revalidate = next.revalidate;
                    }
                    if (!forceDynamic && next.revalidate === 0) {
                        const dynamicUsageReason = `revalidate: ${next.revalidate} fetch ${input}${staticGenerationStore.pathname ? ` ${staticGenerationStore.pathname}` : ""}`;
                        const err = new DynamicServerError(dynamicUsageReason);
                        staticGenerationStore.dynamicUsageStack = err.stack;
                        staticGenerationStore.dynamicUsageDescription = dynamicUsageReason;
                        throw err;
                    }
                }
                if (hasNextConfig) delete init.next;
            }
        }
        return doOriginalFetch();
    });
    globalThis.fetch.patched = true;
}

//# sourceMappingURL=patch-fetch.js.map