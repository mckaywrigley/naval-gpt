import type { StaticGenerationAsyncStorage } from '../client/components/static-generation-async-storage';
import type { RenderOpts } from './app-render';
declare type RunWithStaticGenerationAsyncStorageContext = {
    pathname: string;
    renderOpts: RenderOpts;
};
export declare function runWithStaticGenerationAsyncStorage<Result>(staticGenerationAsyncStorage: StaticGenerationAsyncStorage, { pathname, renderOpts }: RunWithStaticGenerationAsyncStorageContext, callback: () => Promise<Result>): Promise<Result>;
export {};
