import { FLIGHT_PARAMETERS } from "../client/components/app-router-headers";
import { ReadonlyHeaders, ReadonlyRequestCookies } from "./app-render";
function headersWithoutFlight(headers) {
    const newHeaders = {
        ...headers
    };
    for (const param of FLIGHT_PARAMETERS){
        delete newHeaders[param.toString().toLowerCase()];
    }
    return newHeaders;
}
export function runWithRequestAsyncStorage(requestAsyncStorage, { req , res , renderOpts  }, callback) {
    const tryGetPreviewData = process.env.NEXT_RUNTIME === "edge" ? ()=>false : require("./api-utils/node").tryGetPreviewData;
    // Reads of this are cached on the `req` object, so this should resolve
    // instantly. There's no need to pass this data down from a previous
    // invoke, where we'd have to consider server & serverless.
    const previewData = renderOpts ? tryGetPreviewData(req, res, renderOpts.previewProps) : false;
    let cachedHeadersInstance;
    let cachedCookiesInstance;
    const store = {
        get headers () {
            if (!cachedHeadersInstance) {
                cachedHeadersInstance = new ReadonlyHeaders(headersWithoutFlight(req.headers));
            }
            return cachedHeadersInstance;
        },
        get cookies () {
            if (!cachedCookiesInstance) {
                cachedCookiesInstance = new ReadonlyRequestCookies({
                    headers: {
                        get: (key)=>{
                            if (key !== "cookie") {
                                throw new Error("Only cookie header is supported");
                            }
                            return req.headers.cookie;
                        }
                    }
                });
            }
            return cachedCookiesInstance;
        },
        previewData
    };
    return requestAsyncStorage.run(store, callback);
}

//# sourceMappingURL=run-with-request-async-storage.js.map