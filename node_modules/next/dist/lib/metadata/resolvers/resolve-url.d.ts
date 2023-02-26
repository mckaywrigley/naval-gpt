import type { ResolvedMetadata } from '../types/metadata-interface';
declare function isStringOrURL(icon: any): icon is string | URL;
declare function resolveUrl(url: string | URL | null | undefined, metadataBase: URL | null): URL | null;
declare function resolveUrlValuesOfObject(obj: Record<string, string | URL | null> | null | undefined, metadataBase: ResolvedMetadata['metadataBase']): null | Record<string, URL | null>;
export { isStringOrURL, resolveUrl, resolveUrlValuesOfObject };
