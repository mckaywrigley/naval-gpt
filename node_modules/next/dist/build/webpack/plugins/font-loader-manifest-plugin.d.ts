import { webpack } from 'next/dist/compiled/webpack/webpack';
export declare type FontLoaderManifest = {
    pages: {
        [path: string]: string[];
    };
    app: {
        [moduleRequest: string]: string[];
    };
    appUsingSizeAdjust: boolean;
    pagesUsingSizeAdjust: boolean;
};
export declare class FontLoaderManifestPlugin {
    private appDirEnabled;
    constructor(options: {
        appDirEnabled: boolean;
    });
    apply(compiler: webpack.Compiler): void;
}
