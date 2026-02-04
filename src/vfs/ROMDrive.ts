// services/drives/MemoryDrive.ts

import { sleep } from '../libs/utils';
import { FileEntry, IDrive, VFS } from './vfs';

const now = Date.now();

const ROOT: any = {
    type: 'dir',
    "name": "root",
    "lastModified": now,
    children: {
        "about-rom-drive.txt": { type: 'file', content: new Blob(["About ROM Drive"], { type: 'text/plain' }) },
    }

};


export class ROMDrive implements IDrive {
    //label = "RAM:";
    isReadOnly = true;
    private root = ROOT;

    private navigate(path: string, createMissing = false) {
        const parts = path.split('/').filter(Boolean);
        let curr = this.root;
        for (const part of parts) {
            if (!curr.children[part]) {
                if (createMissing) curr.children[part] = { type: 'dir', children: {} };
                else return null;
            }
            curr = curr.children[part];
        }
        return curr;
    }

    async ls(path: string): Promise<FileEntry[]> {
        await sleep(500); // Simulate async delay
        const node = this.navigate(path);
        if (!node || node.type !== 'dir') return [];
        return Object.entries(node.children).map(([name, data]: [string, any]) => ({
            name,
            kind: data.type === 'dir' ? 'directory' : 'file',
            size: data.content?.size || 0,
            lastModified: data.type === 'dir' ? undefined : now
        }));
    }

    // async write(path: string, data: Blob) {
    //     const parts = path.split('/');
    //     const name = parts.pop()!;
    //     const parent = this.navigate(parts.join('/'), true);
    //     parent.children[name] = { type: 'file', content: data };
    // }

    async read(path: string) {
        // await sleep(500); // Simulate async delay
        const node = this.navigate(path);
        if (!node || node.type !== 'file') throw new Error("Not found");
        return node.content;
    }

    // async rm(path: string) {
    //     const parts = path.split('/');
    //     const name = parts.pop()!;
    //     const parent = this.navigate(parts.join('/'));
    //     if (parent) delete parent.children[name];
    // }

    // async mkdir(path: string) {
    //     this.navigate(path, true);
    //     console.log(`Created directory at ${path}`)
    // }

    async info(path: string): Promise<FileEntry> {
        const node = this.navigate(path);
        if (!node) {
            throw new Error("File or directory not found");
        }

        const name = path.split('/').filter(Boolean).pop() || 'root';

        if (node.type === 'file') {
            return {
                name,
                kind: 'file',
                size: node.content?.size || 0,
                lastModified: Date.now()
            };
        } else {
            return {
                name,
                kind: 'directory',
                size: 0,
                //lastModified: Date.now()
            };
        }
    }
}



