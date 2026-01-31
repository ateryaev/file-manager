import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { FileEntry, VFS } from "../../vfs/vfs";
import { modalManager } from "../../libs/modalManager";

export const PanesContext = createContext<any>({});
export const PaneContext = createContext<any>({});

export function PanesContextProvider({ children }: { children: React.ReactNode }) {
    const [activePane, setActivePane] = useState<number>(0);
    const nextIdRef = useRef(0);
    const panesRef = useRef<Set<number>>(new Set());

    const allocateId = useCallback(() => {
        const id = nextIdRef.current++;
        panesRef.current.add(id);
        return id;
    }, []);

    const releaseId = useCallback((id: number) => {
        panesRef.current.delete(id);
    }, []);
    return <PanesContext.Provider value={{ activePane, setActivePane, allocateId, releaseId }}>{children}</PanesContext.Provider>;
}

export function usePaneKeyboard(handlers: Record<string, (e: KeyboardEvent) => void>) {
    const { registerHandlers } = useContext(PaneContext);

    useEffect(() => {
        const unregister = registerHandlers(handlers);
        return () => unregister();
    }, [handlers, registerHandlers]);
}

export function PaneContextProvider({ children }: { children: React.ReactNode }) {
    const { activePane, setActivePane, allocateId, releaseId } = useContext(PanesContext);
    const idRef = useRef<number | undefined>(undefined);

    if (idRef.current === undefined) {
        idRef.current = allocateId();
    }
    const id = idRef.current;
    useEffect(() => {
        return () => releaseId(id);
    }, [releaseId]);

    // Handler to activate this pane
    const activate = useCallback(() => {
        setActivePane(id);
    }, [setActivePane]);

    const [location, setLocation] = useState<string>("RAM://");
    const [fileInfo, setFileInfo] = useState<FileEntry | null>(null);
    const [files, setFiles] = useState<FileEntry[] | null>(null);
    const [fileBlob, setFileBlob] = useState<Blob | null>(null);
    const active = activePane === id;

    const handlersRef = useRef<Record<string, (e: KeyboardEvent) => void>>({});
    const registerHandlers = useCallback((handlers: Record<string, (e: KeyboardEvent) => void>) => {
        // We add them to the collection
        Object.assign(handlersRef.current, handlers);
        // Return a cleanup to remove them
        return () => {
            Object.keys(handlers).forEach(key => delete handlersRef.current[key]);
        };
    }, []);
    // The ONLY window listener for this pane
    useEffect(() => {
        if (!active) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (modalManager.isShowing()) return;
            const handler = handlersRef.current[e.key];
            if (!handler) return;
            handler(e);
            e.preventDefault();
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [active]); // Only re-bind if pane focus changes

    //historyRef.current[location] = {any};
    const historyRef = useRef<Record<string, any>>({});
    const getHistory = useCallback(() => {
        return historyRef.current[location] || {};
    }, [location]);

    const setHistory = useCallback((history: any) => {
        historyRef.current[location] = history;
    }, [location]);



    useEffect(() => {
        setFileInfo(null);
        setFiles(null);
        setFileBlob(null);

        async function load() {
            const fileInfo = await VFS.info(location);
            if (fileInfo.kind === "directory") {
                const files = await VFS.ls(location);
                setFiles(files);
            }
            if (fileInfo.kind === "file") {
                const blob = await VFS.read(location);
                setFileBlob(blob);
            }
            setFileInfo(fileInfo);
        }
        load();
        return VFS.subscribe(location, load);
    }, [location]);

    return <PaneContext.Provider value={{ location, active, files, fileBlob, fileInfo, setLocation, getHistory, setHistory, registerHandlers, activate }}>{children}</PaneContext.Provider>;
}