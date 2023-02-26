import { webpack, sources } from "next/dist/compiled/webpack/webpack";
import getRouteFromEntrypoint from "../../../server/get-route-from-entrypoint";
import { FONT_LOADER_MANIFEST } from "../../../shared/lib/constants";
const PLUGIN_NAME = "FontLoaderManifestPlugin";
const fontLoaderTargets = [
    require.resolve("next/font/google/target.css"),
    require.resolve("next/font/local/target.css"),
    // TODO: remove this in the next major version
    /node_modules\/@next\/font\/google\/target\.css\?{.+}$/,
    /node_modules\/@next\/font\/local\/target\.css\?{.+}$/, 
];
// Creates a manifest of all fonts that should be preloaded given a route
export class FontLoaderManifestPlugin {
    constructor(options){
        this.appDirEnabled = options.appDirEnabled;
    }
    apply(compiler) {
        compiler.hooks.make.tap(PLUGIN_NAME, (compilation)=>{
            let fontLoaderModules;
            // Get all font loader modules
            if (this.appDirEnabled) {
                compilation.hooks.finishModules.tap(PLUGIN_NAME, (modules)=>{
                    const modulesArr = Array.from(modules);
                    fontLoaderModules = modulesArr.filter((mod)=>{
                        return fontLoaderTargets.some((fontLoaderTarget)=>{
                            var ref;
                            return typeof fontLoaderTarget === "string" ? (ref = mod.userRequest) == null ? void 0 : ref.startsWith(`${fontLoaderTarget}?`) : fontLoaderTarget.test(mod.userRequest);
                        });
                    });
                });
            }
            compilation.hooks.processAssets.tap({
                name: PLUGIN_NAME,
                stage: webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONS
            }, (assets)=>{
                const fontLoaderManifest = {
                    pages: {},
                    app: {},
                    appUsingSizeAdjust: false,
                    pagesUsingSizeAdjust: false
                };
                if (this.appDirEnabled) {
                    for (const mod of fontLoaderModules){
                        var ref;
                        if (!((ref = mod.buildInfo) == null ? void 0 : ref.assets)) continue;
                        const modAssets = Object.keys(mod.buildInfo.assets);
                        const fontFiles = modAssets.filter((file)=>/\.(woff|woff2|eot|ttf|otf)$/.test(file));
                        if (!fontLoaderManifest.appUsingSizeAdjust) {
                            fontLoaderManifest.appUsingSizeAdjust = fontFiles.some((file)=>file.includes("-s"));
                        }
                        // Font files ending with .p.(woff|woff2|eot|ttf|otf) are preloaded
                        const preloadedFontFiles = fontFiles.filter((file)=>/\.p.(woff|woff2|eot|ttf|otf)$/.test(file));
                        // Create an entry for the request even if no files should preload. If that's the case a preconnect tag is added.
                        if (fontFiles.length > 0) {
                            fontLoaderManifest.app[mod.userRequest] = preloadedFontFiles;
                        }
                    }
                }
                for (const entrypoint of compilation.entrypoints.values()){
                    const pagePath = getRouteFromEntrypoint(entrypoint.name);
                    if (!pagePath) {
                        continue;
                    }
                    const fontFiles = entrypoint.chunks.flatMap((chunk)=>[
                            ...chunk.auxiliaryFiles
                        ]).filter((file)=>/\.(woff|woff2|eot|ttf|otf)$/.test(file));
                    if (!fontLoaderManifest.pagesUsingSizeAdjust) {
                        fontLoaderManifest.pagesUsingSizeAdjust = fontFiles.some((file)=>file.includes("-s"));
                    }
                    // Font files ending with .p.(woff|woff2|eot|ttf|otf) are preloaded
                    const preloadedFontFiles = fontFiles.filter((file)=>/\.p.(woff|woff2|eot|ttf|otf)$/.test(file));
                    // Create an entry for the path even if no files should preload. If that's the case a preconnect tag is added.
                    if (fontFiles.length > 0) {
                        fontLoaderManifest.pages[pagePath] = preloadedFontFiles;
                    }
                }
                const manifest = JSON.stringify(fontLoaderManifest, null, 2);
                assets[`server/${FONT_LOADER_MANIFEST}.js`] = new sources.RawSource(`self.__FONT_LOADER_MANIFEST=${manifest}`);
                assets[`server/${FONT_LOADER_MANIFEST}.json`] = new sources.RawSource(manifest);
            });
        });
        return;
    }
}

//# sourceMappingURL=font-loader-manifest-plugin.js.map