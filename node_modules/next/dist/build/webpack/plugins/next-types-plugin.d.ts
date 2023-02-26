import { webpack } from 'next/dist/compiled/webpack/webpack';
interface Options {
    dir: string;
    distDir: string;
    appDir: string;
    dev: boolean;
    isEdgeServer: boolean;
    typedRoutes: boolean;
}
export declare const pageFiles: Set<string>;
export declare class NextTypesPlugin {
    dir: string;
    distDir: string;
    appDir: string;
    pagesDir: string;
    dev: boolean;
    isEdgeServer: boolean;
    typedRoutes: boolean;
    constructor(options: Options);
    collectPage(filePath: string): void;
    apply(compiler: webpack.Compiler): void;
}
export {};
