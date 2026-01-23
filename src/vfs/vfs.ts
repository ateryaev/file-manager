import { sleep } from "../libs/utils";
//import { FileEntry, IDrive } from "./types";


export type FileEntry = {
    name: string;
    kind: "file" | "directory";
    size?: number;
    lastModified?: number;
};

export interface IDrive {
    ls(path: string): Promise<FileEntry[]>;
    read(path: string): Promise<Blob>;
    write(path: string, data: Blob): Promise<void>;
    rm(path: string): Promise<void>;
    mkdir(path: string): Promise<void>;
}


function fileSort(a: FileEntry, b: FileEntry) {
    if (a.kind === b.kind) {
        return a.name.localeCompare(b.name);
    }
    return a.kind === "directory" ? -1 : 1;
}


export class VFS {
    private static drives: Record<string, IDrive> = {};
    private static bus = new EventTarget();
    private static CHANGE_EVENT = "vfs_change";

    // --- Registration ---
    static registerDrive(label: string, drive: IDrive) {
        this.drives[label] = drive;
        // this.notify(drive);
    }

    static getDrive(label: string): IDrive {
        const drive = this.drives[label];
        if (!drive) throw new Error(`Drive ${label} not found`);
        return drive;
    }

    static async ls(location: string): Promise<FileEntry[]> {
        const [label, path] = location.split(":/");
        const drive = this.getDrive(label);
        console.log(`VFS.ls called on drive: ${label}, path: ${path}`);
        let items = await drive.ls(path);
        if (path !== "/") {
            items.push({ name: "..", kind: "directory" });
        }
        items.sort(fileSort);
        return items;
    }

    static async mkdir(location: string, name: string): Promise<void> {
        const [label, path] = location.split(":/");
        const drive = this.getDrive(label);
        const newPath = path === "/" ? `/${name}` : `${path}/${name}`;
        await drive.mkdir(newPath);
        // this.notify(drive);
    }

    static async read(location: string): Promise<Blob> {
        const [label, path] = location.split(":/");
        const drive = this.getDrive(label);
        return await drive.read(path);
    }
    static getAllLabels(): string[] {
        return Object.keys(this.drives);
    }

    // --- Pub/Sub for UI Sync ---
    // static notify(drive: IDrive) {
    //     //TODO: add path as parameter to optimize updates
    //     const label = Object.keys(this.drives).find(key => this.drives[key] === drive);
    //     console.log("VFS.notify called for drive:", label || "unknown");
    //     if (label) this.bus.dispatchEvent(new CustomEvent(this.CHANGE_EVENT, { detail: label }));
    // }

    // static subscribe(label: string, callback: () => void) {
    //     const handler = (e: any) => { if (e.detail === label) callback(); };
    //     this.bus.addEventListener(this.CHANGE_EVENT, handler);
    //     return () => this.bus.removeEventListener(this.CHANGE_EVENT, handler);
    // }
}