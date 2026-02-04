import { sleep } from '../libs/utils';
import { FileEntry, IDrive, VFS } from './vfs';


//Create from FileSystemDirectoryHandle
//usage: VFS.registerDrive("DRP", new DropDrive(handler: FileSystemDirectoryHandle));

export class DropDrive implements IDrive {
    //label = "DRP:";
    isReadOnly = true;
    private rootHandle: FileSystemDirectoryHandle;

    constructor(directoryHandle: FileSystemDirectoryHandle) {
        this.rootHandle = directoryHandle;
    }

    private async navigate(path: string): Promise<FileSystemHandle | null> {
        const parts = path.split('/').filter(Boolean);
        let current: FileSystemDirectoryHandle = this.rootHandle;

        for (const part of parts) {
            try {
                const handle = await current.getDirectoryHandle(part);
                current = handle;
            } catch {
                // Try as file for the last part
                if (part === parts[parts.length - 1]) {
                    try {
                        return await current.getFileHandle(part);
                    } catch {
                        return null;
                    }
                }
                return null;
            }
        }

        return current;
    }

    async ls(path: string): Promise<FileEntry[]> {
        await sleep(10); // Simulate async delay
        console.log("Listing path in DropDrive:", path);
        const handle = await this.navigate(path);

        if (!handle || handle.kind !== 'directory') return [];

        const dirHandle = handle as FileSystemDirectoryHandle;
        const entries: FileEntry[] = [];

        for await (const [name, entryHandle] of dirHandle.entries()) {
            if (entryHandle.kind === 'file') {
                const fileHandle = entryHandle as FileSystemFileHandle;
                const file = await fileHandle.getFile();
                entries.push({
                    name,
                    kind: 'file',
                    size: file.size,
                    lastModified: file.lastModified
                });
            } else {
                entries.push({
                    name,
                    kind: 'directory',
                    size: 0,
                    //lastModified: Date.now()
                });
            }
        }

        return entries;
    }

    async read(path: string): Promise<Blob> {
        const handle = await this.navigate(path);

        if (!handle || handle.kind !== 'file') {
            throw new Error("File not found");
        }

        const fileHandle = handle as FileSystemFileHandle;
        const file = await fileHandle.getFile();
        console.log("Reading file from DropDrive:", path, file);
        return file;
    }

    async write(path: string, data: Blob): Promise<void> {
        throw new Error("DropDrive is read-only");
    }

    async rm(path: string): Promise<void> {
        throw new Error("DropDrive is read-only");
    }

    async mkdir(path: string): Promise<void> {
        throw new Error("DropDrive is read-only");
    }

    async info(path: string): Promise<FileEntry> {
        const handle = await this.navigate(path);

        if (!handle) {
            throw new Error("File or directory not found");
        }

        const name = path.split('/').filter(Boolean).pop() || this.rootHandle.name;

        if (handle.kind === 'file') {
            const fileHandle = handle as FileSystemFileHandle;
            const file = await fileHandle.getFile();
            return {
                name,
                kind: 'file',
                size: file.size,
                lastModified: file.lastModified
            };
        } else {
            return {
                name,
                kind: 'directory',
                size: 0,
                lastModified: Date.now()
            };
        }
    }
}



