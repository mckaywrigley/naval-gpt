"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.createClientRouterFilter = createClientRouterFilter;
var _bloomFilter = require("../shared/lib/bloom-filter");
var _utils = require("../shared/lib/router/utils");
var _removeTrailingSlash = require("../shared/lib/router/utils/remove-trailing-slash");
const POTENTIAL_ERROR_RATE = 0.02;
function createClientRouterFilter(paths, redirects) {
    const staticPaths = new Set();
    const dynamicPaths = new Set();
    for (const path of paths){
        if ((0, _utils).isDynamicRoute(path)) {
            let subPath = "";
            const pathParts = path.split("/");
            // start at 1 since we split on '/' and the path starts
            // with this so the first entry is an empty string
            for(let i = 1; i < pathParts.length + 1; i++){
                const curPart = pathParts[i];
                if (curPart.startsWith("[")) {
                    break;
                }
                subPath = `${subPath}/${curPart}`;
            }
            if (subPath) {
                dynamicPaths.add(subPath);
            }
        } else {
            staticPaths.add(path);
        }
    }
    for (const redirect of redirects){
        const { source  } = redirect;
        const path = (0, _removeTrailingSlash).removeTrailingSlash(source);
        if (path.includes(":") || path.includes("(")) {
            let subPath = "";
            const pathParts = path.split("/");
            for(let i = 1; i < pathParts.length + 1; i++){
                const curPart = pathParts[i];
                if (curPart.includes(":") || curPart.includes("(")) {
                    break;
                }
                subPath = `${subPath}/${curPart}`;
            }
            // if redirect has matcher at top-level we don't include this
            // as it would match everything
            if (subPath) {
                dynamicPaths.add(subPath);
            }
        } else {
            staticPaths.add(path);
        }
    }
    const staticFilter = _bloomFilter.BloomFilter.from([
        ...staticPaths
    ], POTENTIAL_ERROR_RATE);
    const dynamicFilter = _bloomFilter.BloomFilter.from([
        ...dynamicPaths
    ], POTENTIAL_ERROR_RATE);
    const data = {
        staticFilter: staticFilter.export(),
        dynamicFilter: dynamicFilter.export()
    };
    return data;
}

//# sourceMappingURL=create-router-client-filter.js.map