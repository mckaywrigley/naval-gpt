import { RouteKind } from "../future/route-kind";
import { DefaultRouteMatcherManager } from "../future/route-matcher-managers/default-route-matcher-manager";
class DevRouteMatcherManager extends DefaultRouteMatcherManager {
    constructor(hasPage){
        super();
        this.hasPage = hasPage;
    }
    async match(pathname) {
        if (await this.hasPage(pathname)) {
            return {
                definition: {
                    kind: RouteKind.PAGES,
                    page: "",
                    pathname,
                    filename: "",
                    bundlePath: ""
                },
                params: {}
            };
        }
        return null;
    }
    async test(pathname) {
        return await this.match(pathname) !== null;
    }
}
export async function makeResolver(dir, nextConfig) {
    const url = require("url");
    const { default: Router  } = require("../router");
    const { getPathMatch  } = require("../../shared/lib/router/utils/path-match");
    const { default: DevServer  } = require("../dev/next-dev-server");
    const { NodeNextRequest , NodeNextResponse  } = require("../base-http/node");
    const { default: loadCustomRoutes  } = require("../../lib/load-custom-routes");
    const devServer = new DevServer({
        dir,
        conf: nextConfig
    });
    await devServer.matchers.reload();
    // @ts-expect-error
    devServer.customRoutes = await loadCustomRoutes(nextConfig);
    const routeResults = new WeakMap();
    const routes = devServer.generateRoutes.bind(devServer)();
    routes.matchers = new DevRouteMatcherManager(// @ts-expect-error internal method
    devServer.hasPage.bind(devServer));
    const router = new Router({
        ...routes,
        catchAllRoute: {
            match: getPathMatch("/:path*"),
            name: "catchall route",
            fn: async (req, _res, _params, parsedUrl)=>{
                // clean up internal query values
                for (const key of Object.keys(parsedUrl.query || {})){
                    if (key.startsWith("_next")) {
                        delete parsedUrl.query[key];
                    }
                }
                routeResults.set(req, url.format({
                    pathname: parsedUrl.pathname,
                    query: parsedUrl.query,
                    hash: parsedUrl.hash
                }));
                return {
                    finished: true
                };
            }
        }
    });
    // @ts-expect-error internal field
    router.compiledRoutes = router.compiledRoutes.filter((route)=>{
        var ref;
        const matches = route.type === "rewrite" || route.type === "redirect" || route.type === "header" || route.name === "catchall route" || ((ref = route.name) == null ? void 0 : ref.includes("check"));
        return matches;
    });
    return async function resolveRoute(_req, _res) {
        const req = new NodeNextRequest(_req);
        const res = new NodeNextResponse(_res);
        req._initUrl = req.url;
        await router.execute.bind(router)(req, res, url.parse(req.url, true));
        if (!res.originalResponse.headersSent) {
            res.setHeader("x-nextjs-route-result", "1");
            const resolvedUrl = routeResults.get(req);
            routeResults.delete(req);
            const routeResult = resolvedUrl == null ? {
                type: "none"
            } : {
                type: "rewrite",
                url: resolvedUrl,
                statusCode: 200,
                headers: res.originalResponse.getHeaders()
            };
            res.body(JSON.stringify(routeResult)).send();
        }
    };
}

//# sourceMappingURL=route-resolver.js.map