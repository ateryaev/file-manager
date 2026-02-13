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
        "docs folder long name test string one two three": {
            type: 'dir', children: {
                "welcome.txt": { type: 'file', content: new Blob(["Welcome to the RAM Drive! This is a temporary storage area."], { type: 'text/plain' }) },
                "help.md": { type: 'file', content: new Blob(["# Help Documentation\n\nThis is the help file for the RAM Drive."], { type: 'text/markdown' }) },
                "faq.txt": { type: 'file', content: new Blob(["Q: Is this storage permanent?\nA: No, all data will be lost when the application closes."], { type: 'text/plain' }) },
                "guide.pdf": { type: 'file', content: new Blob([]) },
                "manual.docx": { type: 'file', content: new Blob([]) },
                "tutorial.txt": { type: 'file', content: new Blob(["This is a tutorial file to help you get started."], { type: 'text/plain' }) },
                "overview.md": { type: 'file', content: new Blob(["# RAM Drive Overview\n\nThe RAM Drive is an in-memory file system."], { type: 'text/markdown' }) },
            }
        },
        "xxx": {
            type: 'dir', children: {
                // Generate 200 files named file001.txt to file200.txt, each with some content
                ...(() => {
                    const files: Record<string, any> = {};
                    for (let i = 1; i <= 200; i++) {
                        const num = i.toString().padStart(3, '0');
                        const fname = `file${num}.txt`;
                        files[fname] = {
                            type: 'file',
                            content: new Blob([`This is content for ${fname} in /xxx directory. Line number: ${i}`], { type: 'text/plain' })
                        };
                    }
                    return files;
                })(),
            }
        },
        "xxx.bin": { type: 'file', content: new Blob([new ArrayBuffer(1024 * 1024 * 10)], { type: 'application/octet-stream' }) },
        "image.svg": { type: 'file', content: new Blob([`<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red" /></svg>`], { type: 'image/svg+xml' }) },
        "readme.txt": {
            type: 'file',
            content: new Blob([
                `# RAM Drive - In-Memory File System

## Overview
Welcome to the RAM Drive! This is a temporary, in-memory file system that provides fast access to files and directories during your session. All data stored here is volatile and will be lost when the application closes or the browser is refreshed.

## Features
- **High Performance**: All operations are performed in memory for maximum speed
- **No Persistence**: Perfect for temporary files, caches, and working directories
- **Full File System API**: Supports standard operations like read, write, delete, mkdir, and ls
- **Hierarchical Structure**: Organize your files with nested directories
- **Blob Storage**: Files are stored as Blob objects, supporting various data types

## Use Cases
1. **Temporary Working Space**: Store intermediate files during data processing
2. **Cache Storage**: Keep frequently accessed data in memory for quick retrieval
3. **Development & Testing**: Create and test file operations without affecting persistent storage
4. **Session-Based Files**: Store user-uploaded files that don't need to persist
5. **Prototyping**: Quickly test file-based features without backend infrastructure

## Important Notes
⚠️ **DATA LOSS WARNING**: All files and directories in the RAM Drive are temporary!
- Files will be LOST when you close the application
- Files will be LOST when you refresh the browser
- Files will be LOST if the application crashes
- There is NO backup or recovery mechanism

## Best Practices
- Always backup important files to persistent storage (e.g., download to disk)
- Use RAM Drive for temporary or disposable data only
- Consider file size limitations based on available memory
- Monitor memory usage for large file operations

## Getting Started
This drive comes pre-populated with example files and directories to help you get started:
- /docs - Documentation and help files
- /src - Source code examples
- /assets - Static resources
- /examples - Sample files demonstrating various features
- /scripts - Utility scripts
- /tests - Test files and fixtures

## Technical Details
- Implementation: TypeScript-based in-memory file system
- Storage: Files stored as Blob objects in JavaScript memory
- Structure: Tree-based hierarchy with directories and files
- Interface: Implements IDrive interface for VFS compatibility

## Support
For more information about the file system API and usage examples, please refer to the documentation in the /docs directory.

Version: 0.1.0
Last Updated: ${new Date().toISOString().split('T')[0]}

---
Remember: This is temporary storage. Always save important work to persistent storage!
`
            ], { type: 'text/plain' })
        },
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
const now = Date.now();
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
        //await sleep(500); // Simulate async delay
        const node = this.navigate(path);
        if (!node || node.type !== 'dir') return [];
        return Object.entries(node.children).map(([name, data]: [string, any]) => ({
            name,
            kind: data.type === 'dir' ? 'directory' : 'file',
            size: data.content?.size || 0,
            lastModified: data.type === 'dir' ? undefined : now,
            readonly: false
        }));
    }

    async write(path: string, data: Blob) {
        const parts = path.split('/');
        const name = parts.pop()!;
        const parent = this.navigate(parts.join('/'), true);
        parent.children[name] = { type: 'file', content: data };
    }

    async read(path: string) {
        //await sleep(500); // Simulate async delay
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

    async info(path: string): Promise<FileEntry | null> {
        const node = this.navigate(path);
        if (!node) return null; //return null for non-existent paths, instead of throwing an error

        const name = path.split('/').filter(Boolean).pop() || '';

        if (node.type === 'file') {
            return {
                name,
                kind: 'file',
                size: node.content?.size || 0,
                lastModified: now,
                readonly: false
            };
        } else {
            return {
                name,
                kind: 'directory',
                size: 0,
                readonly: false
            };
        }
    }
}



