import { resolveAsArrayOrUndefined } from "../generate/utils";
import { resolveUrl, resolveUrlValuesOfObject } from "./resolve-url";
const viewPortKeys = {
    width: "width",
    height: "height",
    initialScale: "initial-scale",
    minimumScale: "minimum-scale",
    maximumScale: "maximum-scale",
    viewportFit: "viewport-fit"
};
export const resolveViewport = (viewport)=>{
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
export const resolveAlternates = (alternates, metadataBase)=>{
    if (!alternates) return null;
    const result = {
        canonical: resolveUrl(alternates.canonical, metadataBase),
        languages: null,
        media: null,
        types: null
    };
    const { languages , media , types  } = alternates;
    result.languages = resolveUrlValuesOfObject(languages, metadataBase);
    result.media = resolveUrlValuesOfObject(media, metadataBase);
    result.types = resolveUrlValuesOfObject(types, metadataBase);
    return result;
};
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
export const resolveRobots = (robots)=>{
    if (!robots) return null;
    return {
        basic: resolveRobotsValue(robots),
        googleBot: typeof robots !== "string" ? resolveRobotsValue(robots.googleBot) : null
    };
};
const VerificationKeys = [
    "google",
    "yahoo",
    "yandex",
    "me",
    "other"
];
export const resolveVerification = (verification)=>{
    if (!verification) return null;
    const res = {};
    for (const key of VerificationKeys){
        const value = verification[key];
        if (value) {
            if (key === "other") {
                res.other = {};
                for(const otherKey in verification.other){
                    const otherValue = resolveAsArrayOrUndefined(verification.other[otherKey]);
                    if (otherValue) res.other[otherKey] = otherValue;
                }
            } else res[key] = resolveAsArrayOrUndefined(value);
        }
    }
    return res;
};
export const resolveAppleWebApp = (appWebApp)=>{
    var ref;
    if (!appWebApp) return null;
    if (appWebApp === true) {
        return {
            capable: true
        };
    }
    const startupImages = (ref = resolveAsArrayOrUndefined(appWebApp.startupImage)) == null ? void 0 : ref.map((item)=>typeof item === "string" ? {
            url: item
        } : item);
    return {
        capable: "capable" in appWebApp ? !!appWebApp.capable : true,
        title: appWebApp.title || null,
        startupImage: startupImages || null,
        statusBarStyle: appWebApp.statusBarStyle || "default"
    };
};
export const resolveAppLinks = (appLinks)=>{
    if (!appLinks) return null;
    for(const key in appLinks){
        // @ts-ignore // TODO: type infer
        appLinks[key] = resolveAsArrayOrUndefined(appLinks[key]);
    }
    return appLinks;
};

//# sourceMappingURL=resolve-basics.js.map