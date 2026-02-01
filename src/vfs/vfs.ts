import { sleep } from "../libs/utils";
//import { FileEntry, IDrive } from "./types";


export type FileEntry = {
    name: string;
    kind: "file" | "directory" | "drive" | "root";
    description?: string;
    size?: number;
    lastModified?: number;
};

export interface IDrive {
    ls(path: string): Promise<FileEntry[]>;
    read(path: string): Promise<Blob>;
    write(path: string, data: Blob): Promise<void>;
    rm(path: string): Promise<void>;
    mkdir(path: string): Promise<void>;
    info(path: string): Promise<FileEntry>;
}


function fileSort(a: FileEntry, b: FileEntry) {
    if (a.name === "..") return -1;
    if (b.name === "..") return 1;
    if (a.kind === b.kind) {
        return a.name.localeCompare(b.name);
    }
    return a.kind === "directory" ? -1 : 1;
}

export class VFS {
    private static drives: Record<string, IDrive> = {};
    private static driveDescriptions: Record<string, string> = {};
    private static bus = new EventTarget();
    private static CHANGE_EVENT = "vfs_change";

    // --- Registration ---
    static registerDrive(label: string, drive: IDrive, description?: string) {
        this.drives[label] = drive;
        this.driveDescriptions[label] = description || "";
        // this.notify(drive);
    }

    static getDrive(label: string): IDrive {
        const drive = this.drives[label];
        if (!drive) throw new Error(`Drive ${label} not found`);
        return drive;
    }

    static async info(location: string): Promise<FileEntry> {
        if (!location) return {
            name: "root",
            kind: "root",
            description: "Web File Manager Drives List"
        }
        const [label, path] = location.split(":");

        const drive = this.getDrive(label);
        return await drive.info(path);
    }

    static async ls(location: string): Promise<FileEntry[]> {
        if (!location) {
            const items: FileEntry[] = [];
            for (const label of this.getAllLabels()) {
                items.push({ name: `${label}:`, kind: "drive", description: this.driveDescriptions[label] });
            }
            return items;
        }
        const [label, path] = location.split(":");
        const drive = this.getDrive(label);
        console.log(`VFS.ls called on drive: ${label}, path: ${path}`);
        //await sleep(500); // Simulate latency
        let items = await drive.ls(path);
        //if (path !== "/") {
        items.push({ name: "..", kind: "directory" });
        //}
        items.sort(fileSort);
        return items;
    }

    static async mkdir(location: string, name: string): Promise<void> {
        const [label, path] = location.split(":/");
        const drive = this.getDrive(label);
        const newPath = path === "/" ? `/${name}` : `${path}/${name}`;
        await drive.mkdir(newPath);
        this.notify(location);
    }
    static async rm(location: string, name: string): Promise<void> {
        const [label, path] = location.split(":/");
        const drive = this.getDrive(label);
        const newPath = path === "/" ? `/${name}` : `${path}/${name}`;
        await drive.rm(newPath);
        this.notify(location);
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
    static notify(location: string) {
        //TODO: add path as parameter to optimize updates
        //const label = Object.keys(this.drives).find(key => this.drives[key] === drive);
        console.log("VFS.notify called for location:", location || "unknown");
        if (location) this.bus.dispatchEvent(new CustomEvent(this.CHANGE_EVENT, { detail: location }));
    }

    static subscribe(location: string, callback: () => void) {
        const handler = (e: any) => { if (e.detail === location) callback(); };
        this.bus.addEventListener(this.CHANGE_EVENT, handler);
        return () => this.bus.removeEventListener(this.CHANGE_EVENT, handler);
    }
}