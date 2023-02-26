import { DynamicServerError } from './hooks-server-context';
import { staticGenerationAsyncStorage } from './static-generation-async-storage';
export function staticGenerationBailout(reason) {
    const staticGenerationStore = staticGenerationAsyncStorage.getStore();
    if (staticGenerationStore == null ? void 0 : staticGenerationStore.forceStatic) {
        return true;
    }
    if (staticGenerationStore == null ? void 0 : staticGenerationStore.isStaticGeneration) {
        staticGenerationStore.revalidate = 0;
        const err = new DynamicServerError(reason);
        staticGenerationStore.dynamicUsageDescription = reason;
        staticGenerationStore.dynamicUsageStack = err.stack;
        throw err;
    }
    return false;
}

//# sourceMappingURL=static-generation-bailout.js.map