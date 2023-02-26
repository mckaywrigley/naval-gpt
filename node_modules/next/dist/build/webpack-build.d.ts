import { TurbotraceContext } from './webpack/plugins/next-trace-entrypoints-plugin';
export declare function webpackBuild(): Promise<{
    duration: number;
    turbotraceContext?: TurbotraceContext | undefined;
}>;
