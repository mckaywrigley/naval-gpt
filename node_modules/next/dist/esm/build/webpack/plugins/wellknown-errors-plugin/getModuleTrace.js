import { relative } from "path";
export function formatModule(compiler, module) {
    return relative(compiler.context, module.resource).replace(/\?.+$/, "");
}
export function getImportTraceForOverlay(compiler, moduleTrace) {
    return moduleTrace.map((m)=>m.resource ? "  " + formatModule(compiler, m) : "").filter(Boolean).join("\n");
}
export function getModuleTrace(module, compilation, compiler) {
    // Get the module trace:
    // https://cs.github.com/webpack/webpack/blob/9fcaa243573005d6fdece9a3f8d89a0e8b399613/lib/stats/DefaultStatsFactoryPlugin.js#L414
    const visitedModules = new Set();
    const moduleTrace = [];
    let current = module;
    let isPagesDir = false;
    while(current){
        if (visitedModules.has(current)) break;
        if (/[\\/]pages/.test(current.resource.replace(compiler.context, ""))) {
            isPagesDir = true;
        }
        visitedModules.add(current);
        moduleTrace.push(current);
        const origin = compilation.moduleGraph.getIssuer(current);
        if (!origin) break;
        current = origin;
    }
    return {
        moduleTrace,
        isPagesDir
    };
}

//# sourceMappingURL=getModuleTrace.js.map