import type { webpack } from 'next/dist/compiled/webpack/webpack';
export declare function formatModule(compiler: webpack.Compiler, module: any): string;
export declare function getImportTraceForOverlay(compiler: webpack.Compiler, moduleTrace: any[]): string;
export declare function getModuleTrace(module: any, compilation: webpack.Compilation, compiler: webpack.Compiler): {
    moduleTrace: any[];
    isPagesDir: boolean;
};
