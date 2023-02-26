import { formatModule, getModuleTrace } from "./getModuleTrace";
import { SimpleWebpackError } from "./simpleWebpackError";
export function getNextInvalidImportError(err, module, compilation, compiler) {
    try {
        if (!module.loaders.find((loader)=>loader.loader.includes("next-invalid-import-error-loader.js"))) {
            return false;
        }
        const { moduleTrace  } = getModuleTrace(module, compilation, compiler);
        let importTrace = [];
        let firstExternalModule;
        for(let i = moduleTrace.length - 1; i >= 0; i--){
            const mod = moduleTrace[i];
            if (!mod.resource) continue;
            if (!mod.resource.includes("node_modules/")) {
                importTrace.unshift(formatModule(compiler, mod));
            } else {
                firstExternalModule = mod;
                break;
            }
        }
        let invalidImportMessage = "";
        if (firstExternalModule) {
            let formattedExternalFile = firstExternalModule.resource.split("node_modules");
            formattedExternalFile = formattedExternalFile[formattedExternalFile.length - 1];
            invalidImportMessage += `\n\nThe error was caused by importing '${formattedExternalFile.slice(1)}' in '${importTrace[0]}'.`;
        }
        return new SimpleWebpackError(importTrace[0], err.message + invalidImportMessage + (importTrace.length > 0 ? `\n\nImport trace for requested module:\n${importTrace.map((mod)=>"  " + mod).join("\n")}` : ""));
    } catch  {
        return false;
    }
}

//# sourceMappingURL=parseNextInvalidImportError.js.map