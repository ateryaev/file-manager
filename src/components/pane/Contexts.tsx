import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { FileEntry, VFS } from "../../vfs/vfs";

export const PanesContext = createContext<any>({});
export const PaneContext = createContext<any>({});

export type Side = "left" | "right";
export type PaneMode = "files" | "view" | "view-as-text" | "view-as-binary" | "view-as-image" | "edit-text";

export type PaneState = {
    location: string; // e.g. "RAM:/docs"
    parent?: FileEntry; // info about the parent directory, used for ".." navigation and file operations
    selection?: FileEntry; // currently selected file, used for operations like rename, delete, view, etc.
    files?: FileEntry[]; // list of files in the current directory, undefined if not loaded yet
    blob?: Blob; // if this pane is viewing a file, the file content blob
    mode?: PaneMode; // current mode of the pane, determines how to display the content and what operations are available
}

export function PanesContextProvider({ children }: { children: React.ReactNode }) {
    const [panes, setPanes] = useState<Record<Side, PaneState>>({
        left: { location: "RAM:", mode: "files" },
        right: { location: "RAM:", mode: "files" }
    });

    const [activeSide, setActiveSide] = useState<Side>("left");

    const updatePane = useCallback((side: Side, updates: Partial<PaneState>) => {
        setPanes(prev => ({
            ...prev,
            [side]: { ...prev[side], ...updates }
        }));
    }, []);

    const value = {
        panes, //number | null, currently active pane id, null if no pane is active
        activeSide, //number, paneId to activate next,
        setActiveSide, //(paneId: number) => void, function to activate a pane by id
        updatePane, //() => number, function to register a pane and get its id
    };

    return <PanesContext.Provider value={value}>{children}</PanesContext.Provider>;
}

export function PaneContextProvider({ side, children }: { side: Side, children: React.ReactNode }) {
    const { panes, activeSide, setActiveSide, updatePane } = useContext(PanesContext);

    const state = panes[side];
    const isActive = activeSide === side;

    const update = useCallback((updates: Partial<PaneState>) => updatePane(side, updates), [side, updatePane]);
    const activate = () => setActiveSide(side);

    useEffect(() => {
        update({ files: undefined, blob: undefined, selection: undefined });
        async function load() {
            console.log("Loading pane content for location:", state.location);
            const fileInfo = await VFS.info(state.location);
            if (fileInfo.kind !== "file") {
                const files = await VFS.ls(state.location);
                if (fileInfo.kind === "directory") {
                    files[0].lastModified = fileInfo.lastModified;
                }
                update({ files });
            }
            if (fileInfo.kind === "file") {
                const blob = await VFS.read(state.location);
                update({ blob });
            }
            update({ parent: fileInfo });
        }
        load();
        return VFS.subscribe(state.location, load);
    }, [state.location]);

    const navigate = useCallback((location: string, mode: PaneMode = "files") => {
        update({ location, mode, files: undefined, blob: undefined, selection: undefined });
    }, [update]);

    return <PaneContext.Provider value={{ ...state, update, side, isActive, activate, navigate }}>
        {children}
    </ PaneContext.Provider>;
}