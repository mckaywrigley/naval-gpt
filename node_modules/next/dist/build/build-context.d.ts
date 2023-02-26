import { LoadedEnvFiles } from '@next/env';
import { Ora } from 'next/dist/compiled/ora';
import { Rewrite } from '../lib/load-custom-routes';
import { __ApiPreviewProps } from '../server/api-utils';
import { NextConfigComplete } from '../server/config-shared';
import { Span } from '../trace';
import type getBaseWebpackConfig from './webpack-config';
import { TelemetryPlugin } from './webpack/plugins/telemetry-plugin';
export declare const NextBuildContext: Partial<{
    dir: string;
    buildId: string;
    config: NextConfigComplete;
    appDir: string;
    pagesDir: string;
    rewrites: {
        fallback: Rewrite[];
        afterFiles: Rewrite[];
        beforeFiles: Rewrite[];
    };
    loadedEnvFiles: LoadedEnvFiles;
    previewProps: __ApiPreviewProps;
    mappedPages: {
        [page: string]: string;
    } | undefined;
    mappedAppPages: {
        [page: string]: string;
    } | undefined;
    mappedRootPaths: {
        [page: string]: string;
    };
    hasInstrumentationHook: boolean;
    telemetryPlugin: TelemetryPlugin;
    buildSpinner: Ora;
    nextBuildSpan: Span;
    reactProductionProfiling: boolean;
    noMangling: boolean;
    appDirOnly: boolean;
    clientRouterFilters: Parameters<typeof getBaseWebpackConfig>[1]['clientRouterFilters'];
}>;
