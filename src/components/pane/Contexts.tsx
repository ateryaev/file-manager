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
    cursor?: string; // name of the file that has keyboard focus in the file list, can be different from selection during navigation
    files?: FileEntry[]; // list of files in the current directory, undefined if not loaded yet
    blob?: Blob; // if this pane is viewing a file, the file content blob
    mode?: PaneMode; // current mode of the pane, determines how to display the content and what operations are available
    busy?: boolean; // whether the pane is currently performing an operation, used to disable interactions or show loading state
}

export function PanesContextProvider({ children }: { children: React.ReactNode }) {
    const [panes, setPanes] = useState<Record<Side, PaneState>>({
        left: { location: "RAM:", mode: "files" },
        right: { location: "ROM:", mode: "files" }
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
        //if (!state.location) return;
        //if (state.busy) return;
        update({ files: undefined, blob: undefined, selection: undefined, cursor: undefined });

        async function load() {
            //update({ files: undefined, blob: undefined, selection: undefined, cursor: undefined});
            console.log("Loading pane content for location1:", state.location);
            const fileInfo = await VFS.info(state.location);
            console.log("Loading pane content for location2:", state.location, fileInfo);
            if (fileInfo.kind !== "file") {
                const files = await VFS.ls(state.location);
                if (fileInfo.kind === "directory") {
                    files[0].lastModified = fileInfo.lastModified;
                }
                update({ parent: fileInfo, files });
            }
            if (fileInfo.kind === "file") {
                const blob = await VFS.read(state.location);
                update({ parent: fileInfo, blob });
            }
        }
        load();
        return VFS.subscribe(state.location, load);
    }, [state.location, update]);

    const navigate = useCallback((location: string, mode: PaneMode = "files") => {
        update({ location, mode, files: undefined, blob: undefined, selection: undefined, cursor: undefined });
    }, [update]);

    return <PaneContext.Provider value={{ ...state, update, side, isActive, activate, navigate }}>
        {children}
    </ PaneContext.Provider>;
}