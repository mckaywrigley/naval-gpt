"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.resolveAppLinks = exports.resolveAppleWebApp = exports.resolveVerification = exports.resolveRobots = exports.resolveAlternates = exports.resolveViewport = void 0;
var _utils = require("../generate/utils");
var _resolveUrl = require("./resolve-url");
const viewPortKeys = {
    width: "width",
    height: "height",
    initialScale: "initial-scale",
    minimumScale: "minimum-scale",
    maximumScale: "maximum-scale",
    viewportFit: "viewport-fit"
};
const resolveViewport = (viewport)=>{
    let resolved = null;
    if (typeof viewport === "string") {
        resolved = viewport;
    } else if (viewport) {
        resolved = "";
        for(const viewportKey_ in viewPortKeys){
            const viewportKey = viewportKey_;
            if (viewport[viewportKey]) {
                if (resolved) resolved += ", ";
                resolved += `${viewPortKeys[viewportKey]}=${viewport[viewportKey]}`;
            }
        }
    }
    return resolved;
};
exports.resolveViewport = resolveViewport;
const resolveAlternates = (alternates, metadataBase)=>{
    if (!alternates) return null;
    const result = {
        canonical: (0, _resolveUrl).resolveUrl(alternates.canonical, metadataBase),
        languages: null,
        media: null,
        types: null
    };
    const { languages , media , types  } = alternates;
    result.languages = (0, _resolveUrl).resolveUrlValuesOfObject(languages, metadataBase);
    result.media = (0, _resolveUrl).resolveUrlValuesOfObject(media, metadataBase);
    result.types = (0, _resolveUrl).resolveUrlValuesOfObject(types, metadataBase);
    return result;
};
exports.resolveAlternates = resolveAlternates;
const robotsKeys = [
    "noarchive",
    "nosnippet",
    "noimageindex",
    "nocache",
    "notranslate",
    "indexifembedded",
    "nositelinkssearchbox",
    "unavailable_after",
    "max-video-preview",
    "max-image-preview",
    "max-snippet", 
];
const resolveRobotsValue = (robots)=>{
    if (!robots) return null;
    if (typeof robots === "string") return robots;
    const values = [];
    if (robots.index) values.push("index");
    else if (typeof robots.index === "boolean") values.push("noindex");
    if (robots.follow) values.push("follow");
    else if (typeof robots.follow === "boolean") values.push("nofollow");
    for (const key of robotsKeys){
        const value = robots[key];
        if (typeof value !== "undefined" && value !== false) {
            values.push(typeof value === "boolean" ? key : `${key}:${value}`);
        }
    }
    return values.join(", ");
};
const resolveRobots = (robots)=>{
    if (!robots) return null;
    return {
        basic: resolveRobotsValue(robots),
        googleBot: typeof robots !== "string" ? resolveRobotsValue(robots.googleBot) : null
    };
};
exports.resolveRobots = resolveRobots;
const VerificationKeys = [
    "google",
    "yahoo",
    "yandex",
    "me",
    "other"
];
const resolveVerification = (verification)=>{
    if (!verification) return null;
    const res = {};
    for (const key of VerificationKeys){
        const value = verification[key];
        if (value) {
            if (key === "other") {
                res.other = {};
                for(const otherKey in verification.other){
                    const otherValue = (0, _utils).resolveAsArrayOrUndefined(verification.other[otherKey]);
                    if (otherValue) res.other[otherKey] = otherValue;
                }
            } else res[key] = (0, _utils).resolveAsArrayOrUndefined(value);
        }
    }
    return res;
};
exports.resolveVerification = resolveVerification;
const resolveAppleWebApp = (appWebApp)=>{
    var ref;
    if (!appWebApp) return null;
    if (appWebApp === true) {
        return {
            capable: true
        };
    }
    const startupImages = (ref = (0, _utils).resolveAsArrayOrUndefined(appWebApp.startupImage)) == null ? void 0 : ref.map((item)=>typeof item === "string" ? {
            url: item
        } : item);
    return {
        capable: "capable" in appWebApp ? !!appWebApp.capable : true,
        title: appWebApp.title || null,
        startupImage: startupImages || null,
        statusBarStyle: appWebApp.statusBarStyle || "default"
    };
};
exports.resolveAppleWebApp = resolveAppleWebApp;
const resolveAppLinks = (appLinks)=>{
    if (!appLinks) return null;
    for(const key in appLinks){
        // @ts-ignore // TODO: type infer
        appLinks[key] = (0, _utils).resolveAsArrayOrUndefined(appLinks[key]);
    }
    return appLinks;
};
exports.resolveAppLinks = resolveAppLinks;

//# sourceMappingURL=resolve-basics.js.map