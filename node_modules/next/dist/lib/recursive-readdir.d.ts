/**
 * Recursively read directory
 * Returns array holding all relative paths
 */
export declare function recursiveReadDir(
/** Directory to read */
dir: string, 
/** Filter for the file name, only the name part is considered, not the full path */
filter: RegExp, 
/** Filter for the file name, only the name part is considered, not the full path */
ignore?: RegExp, 
/** This doesn't have to be provided, it's used for the recursion */
arr?: string[], 
/** Used to replace the initial path, only the relative path is left, it's faster than path.relative. */
rootDir?: string): Promise<string[]>;
