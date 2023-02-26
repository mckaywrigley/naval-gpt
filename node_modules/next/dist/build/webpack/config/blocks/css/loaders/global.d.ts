import type { webpack } from 'next/dist/compiled/webpack/webpack';
import type { ConfigurationContext } from '../../../utils';
export declare function getGlobalCssLoader(ctx: ConfigurationContext, hasAppDir: boolean, postcss: any, preProcessors?: readonly webpack.RuleSetUseItem[]): webpack.RuleSetUseItem[];
