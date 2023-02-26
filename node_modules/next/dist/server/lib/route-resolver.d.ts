import type { IncomingMessage, ServerResponse } from 'http';
import type { NextConfig } from '../config';
export declare function makeResolver(dir: string, nextConfig: NextConfig): Promise<(_req: IncomingMessage, _res: ServerResponse) => Promise<void>>;
