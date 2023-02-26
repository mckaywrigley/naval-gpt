export function resolveAsArrayOrUndefined(value) {
    if (typeof value === "undefined" || value === null) {
        return undefined;
    }
    if (Array.isArray(value)) {
        return value;
    }
    return [
        value
    ];
}

//# sourceMappingURL=utils.js.map