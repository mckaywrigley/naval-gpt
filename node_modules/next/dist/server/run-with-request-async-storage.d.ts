/// <reference types="node" />
import type { IncomingMessage, ServerResponse } from 'http';
import type { RequestAsyncStorage } from '../client/components/request-async-storage';
import { type RenderOpts } from './app-render';
declare type RunWithRequestAsyncStorageContext = {
    req: IncomingMessage;
    res: ServerResponse;
    renderOpts?: RenderOpts;
};
export declare function runWithRequestAsyncStorage<Result>(requestAsyncStorage: RequestAsyncStorage, { req, res, renderOpts }: RunWithRequestAsyncStorageContext, callback: () => Promise<Result>): Promise<Result>;
export {};
