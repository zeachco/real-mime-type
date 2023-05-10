type File = any;
type FileList = File[];
export declare function fromFiles(files: FileList): Promise<unknown[]>;
export declare function fromFile(file: File): Promise<unknown>;
export {};
