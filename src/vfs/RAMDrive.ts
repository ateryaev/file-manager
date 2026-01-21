// services/drives/MemoryDrive.ts

import { sleep } from '../libs/utils';
import { FileEntry, IDrive, VFS } from './vfs';

const ROOT: any = {
    type: 'dir',
    "name": "root",
    "created": Date.now(),
    "lastModified": Date.now(),
    children: {

        ".gitkeep": { type: 'file', content: new Blob([]) },
        "docs": {
            type: 'dir', children: {
                "welcome.txt": { type: 'file', content: new Blob(["Welcome to the RAM Drive! This is a temporary storage area."], { type: 'text/plain' }) }
            }
        },
        "readme.txt": { type: 'file', content: new Blob(["This is a RAM Drive. Files stored here are temporary and will be lost when the application is closed."], { type: 'text/plain' }) }
        ,
        "notes.txt": { type: 'file', content: new Blob(["Project notes:\n- Remember to backup important files."], { type: 'text/plain' }) },
        "todo.md": { type: 'file', content: new Blob(["# TODO\n- Implement feature A\n- Fix bug B"], { type: 'text/markdown' }) },
        "license.md": { type: 'file', content: new Blob(["MIT License\n\nCopyright (c) ..."], { type: 'text/markdown' }) },
        "config.json": { type: 'file', content: new Blob([JSON.stringify({ env: "dev", port: 3000 }, null, 2)], { type: 'application/json' }) },
        "changelog.txt": { type: 'file', content: new Blob(["v0.1.0 - Initial RAM drive contents"], { type: 'text/plain' }) },

        "src": {
            type: 'dir', children: {
                "index.tsx": { type: 'file', content: new Blob(["import React from 'react';\n\nexport default function App(){ return <div>App</div> }"], { type: 'text/plain' }) },
                "components": {
                    type: 'dir', children: {
                        "Button.tsx": { type: 'file', content: new Blob(["import React from 'react';\n\nexport const Button = () => <button>Click</button>;"], { type: 'text/plain' }) }
                    }
                },
                "utils": {
                    type: 'dir', children: {
                        "helpers.ts": { type: 'file', content: new Blob(["export const noop = () => {};"], { type: 'text/plain' }) }
                    }
                }
            }
        },

        "assets": {
            type: 'dir', children: {
                "logo.png": { type: 'file', content: new Blob([]) },
                "styles": {
                    type: 'dir', children: {
                        "main.css": { type: 'file', content: new Blob(["body { margin: 0; font-family: sans-serif; }"], { type: 'text/css' }) }
                    }
                }
            }
        },

        "examples": {
            type: 'dir', children: {
                "demo.txt": { type: 'file', content: new Blob(["Demo usage instructions"], { type: 'text/plain' }) },
                "sample": {
                    type: 'dir', children: {
                        "sample.txt": { type: 'file', content: new Blob(["Sample file content"], { type: 'text/plain' }) }
                    }
                }
            }
        },

        "scripts": {
            type: 'dir', children: {
                "build.sh": { type: 'file', content: new Blob(["#!/bin/sh\necho Building..."], { type: 'text/plain' }) },
                "deploy.sh": { type: 'file', content: new Blob(["#!/bin/sh\necho Deploying..."], { type: 'text/plain' }) }
            }
        },

        "tests": {
            type: 'dir', children: {
                "unit": {
                    type: 'dir', children: {
                        "test1.spec.ts": { type: 'file', content: new Blob(["describe('example', ()=>{ it('works', ()=>{}); });"], { type: 'text/plain' }) }
                    }
                },
                "integration": {
                    type: 'dir', children: {
                        "itest.txt": { type: 'file', content: new Blob(["Integration test placeholder"], { type: 'text/plain' }) }
                    }
                }
            }
        },
    }
};

// services/drives/RAMDrive.ts
export class RAMDrive implements IDrive {
    //label = "RAM:";
    isReadOnly = false;
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
        await sleep(10); // Simulate async delay
        const node = this.navigate(path);
        if (!node || node.type !== 'dir') return [];
        return Object.entries(node.children).map(([name, data]: [string, any]) => ({
            name,
            kind: data.type === 'dir' ? 'directory' : 'file',
            size: data.content?.size || 0,
            lastModified: Date.now()
        }));
    }

    async write(path: string, data: Blob) {
        const parts = path.split('/');
        const name = parts.pop()!;
        const parent = this.navigate(parts.join('/'), true);
        parent.children[name] = { type: 'file', content: data };
    }

    async read(path: string) {
        const node = this.navigate(path);
        if (!node || node.type !== 'file') throw new Error("Not found");
        return node.content;
    }

    async rm(path: string) {
        const parts = path.split('/');
        const name = parts.pop()!;
        const parent = this.navigate(parts.join('/'));
        if (parent) delete parent.children[name];
    }

    async mkdir(path: string) {
        this.navigate(path, true);
        console.log(`Created directory at ${path}`)
    }
}



