import React from "react";
export function AlternatesMetadata({ alternates  }) {
    if (!alternates) return null;
    return /*#__PURE__*/ React.createElement(React.Fragment, null, alternates.canonical ? /*#__PURE__*/ React.createElement("link", {
        rel: "canonical",
        href: alternates.canonical.toString()
    }) : null, alternates.languages ? Object.entries(alternates.languages).map(([locale, url])=>url ? /*#__PURE__*/ React.createElement("link", {
            key: locale,
            rel: "alternate",
            hrefLang: locale,
            href: url.toString()
        }) : null) : null, alternates.media ? Object.entries(alternates.media).map(([media, url])=>url ? /*#__PURE__*/ React.createElement("link", {
            key: media,
            rel: "alternate",
            media: media,
            href: url.toString()
        }) : null) : null, alternates.types ? Object.entries(alternates.types).map(([type, url])=>url ? /*#__PURE__*/ React.createElement("link", {
            key: type,
            rel: "alternate",
            type: type,
            href: url.toString()
        }) : null) : null);
}

//# sourceMappingURL=alternate.js.map