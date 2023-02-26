declare const INTERNAL_URLSEARCHPARAMS_INSTANCE: unique symbol;
export declare class ReadonlyURLSearchParams {
    [INTERNAL_URLSEARCHPARAMS_INSTANCE]: URLSearchParams;
    entries: URLSearchParams['entries'];
    forEach: URLSearchParams['forEach'];
    get: URLSearchParams['get'];
    getAll: URLSearchParams['getAll'];
    has: URLSearchParams['has'];
    keys: URLSearchParams['keys'];
    values: URLSearchParams['values'];
    toString: URLSearchParams['toString'];
    constructor(urlSearchParams: URLSearchParams);
    [Symbol.iterator](): IterableIterator<[string, string]>;
    append(): void;
    delete(): void;
    set(): void;
    sort(): void;
}
export { ServerInsertedHTMLContext, useServerInsertedHTML, } from '../../shared/lib/server-inserted-html';
/**
 * Get the router methods. For example router.push('/dashboard')
 */
export declare function useRouter(): import('../../shared/lib/app-router-context').AppRouterInstance;
/**
 * Get the canonical segment path from the current level to the leaf node.
 */
export declare function useSelectedLayoutSegments(parallelRouteKey?: string): string[];
/**
 * Get the segment below the current level
 */
export declare function useSelectedLayoutSegment(parallelRouteKey?: string): string | null;
export { redirect } from './redirect';
export { notFound } from './not-found';
