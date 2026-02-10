import { memo, useCallback, useContext, useEffect, useRef, useState } from "react";
import { FileEntry, VFS } from "../../vfs/vfs";
import { CardContent, CardHeader } from "../ui/Card";
import { Counter } from "../RenderCounter";
import { PaneContext } from "./Contexts";
import { usePaneHistory, usePaneKeyboard } from "./Hooks";
import { clampLocation } from "../../libs/location";
import { PaneFileListItem } from "./PaneFilesItem";
import { modalManager } from "../../libs/modalManager";
import { ModalMkDir } from "../../dialogs/ModalMkDir";
import { ModalConfirm } from "../../dialogs/ModalConfirm";
import { DropDrive } from "../../vfs/DropDrive";

const PaneFilesList = memo(({ files, cursor, handleSelect, handleExecute }:
    { files?: FileEntry[], cursor: string, handleSelect: (file: FileEntry) => void, handleExecute: (file: FileEntry) => void }) => {
    return (
        <>
            <Counter />
            {files?.map((file) => (
                <PaneFileListItem
                    key={file.name}
                    file={file}
                    selected={file.name === cursor}
                    onSelect={handleSelect}
                    onExecute={handleExecute}
                />
            ))}
        </>
    );
});

export const PaneFiles = memo(({ files, onExecute, onSelect }:
    { files?: FileEntry[], onExecute?: (file: FileEntry) => void, onSelect?: (file?: FileEntry) => void }) => {
    console.log("Rendering PANE FILE LIST");
    //const { setHistory, getHistory } = useContext(PaneContext);

    const { setHistory, getHistory } = usePaneHistory();

    const scrollRef = useRef<HTMLDivElement>(null);
    const [cursor, setCursor] = useState<string | undefined>(undefined);

    useEffect(() => {
        onSelect?.(files?.find(file => file.name === cursor) || files?.[0]);
    }, [cursor, files, onSelect]);

    useEffect(() => {
        if (!files) return;
        //console.log("getHistory:", location, getHistory(), files.length);
        setCursor(getHistory().cursor || files[0]?.name);
        scrollRef.current && (scrollRef.current.scrollTop = getHistory().scroll || 0);
    }, [files, getHistory]);

    const handleExecute = useCallback((file: FileEntry, historyUpdate = true) => {
        if (historyUpdate) setHistory({ cursor: file.name, scroll: scrollRef.current?.scrollTop || 0 });
        //navigate(clampLocation(`${location}/${file.name}`), file.kind === "file" ? "view-as-text" : "files");
        onExecute?.(file);
    }, [onExecute]);

    const handleSelect = useCallback((file: FileEntry) => {
        setCursor(file.name);
        //setHistory({ cursor: file.name, scroll: scrollRef.current?.scrollTop || 0 });
    }, [setCursor]);

    const moveCursor = useCallback((delta: number) => {
        const cursorIndex = files.findIndex(file => file.name === cursor);
        let newIndex = cursorIndex + delta;
        if (newIndex < 0) newIndex = 0;
        if (newIndex >= files.length) newIndex = files.length - 1;
        const newCursor = files[newIndex]?.name || "";
        setCursor(newCursor);
        setHistory({ cursor: newCursor, scroll: scrollRef.current?.scrollTop || 0 });
    }, [files, cursor]);

    usePaneKeyboard({
        ArrowDown: () => {
            moveCursor(1);
        },
        ArrowUp: () => {
            moveCursor(-1);
        },
        ArrowLeft: () => {
            moveCursor(-files.length + 1);
        },
        ArrowRight: () => {
            moveCursor(files.length - 1);
        },
        // F7: async (e) => {

        //     const folderName = await modalManager.show<string | null>(ModalMkDir, { defaultValue: "new folder 1" });
        //     if (folderName) {
        //         await VFS.mkdir(location, folderName);
        //         setHistory({ cursor: folderName, scroll: scrollRef.current?.scrollTop || 0 });
        //     }
        // },
        F8: async (e) => {
            if (!cursor) return;
            const todelete = await modalManager.show<boolean, { message: string }>(ModalConfirm, { message: `Are you sure to delete ${location}/${cursor}?` });
            if (todelete) {
                await VFS.rm(location, cursor);
                setHistory({ cursor: cursor, scroll: scrollRef.current?.scrollTop || 0 }); //TODO: set cursor near deleted file
                console.log("DELETE:", location, cursor);
            }
        },
        F10: (e) => {
            window.showDirectoryPicker({ startIn: 'desktop', mode: 'readwrite' }).then(async (handle: FileSystemDirectoryHandle) => {
                VFS.registerDrive("DROP", new DropDrive(handle), `User's ${handle.name} folder`);
                //setLocation(clampLocation(`${handle.name}://`));
                navigate(clampLocation(`DROP:`));
                //setHistory({ cursor: "", scroll: scrollRef.current?.scrollTop || 0 });
            });
        },
        Escape: () => {
            // setLocation(clampLocation(`${location}/..`));
            handleExecute(files[0], false);
        },
        Enter: () => {
            const file = files.find(file => file.name === cursor) || files[0];
            handleExecute(file);
        }
    });

    return (
        <>
            <CardContent ref={scrollRef} className='flex flex-col gap-0 cursor-default '>
                <PaneFilesList files={files} cursor={cursor || ""}
                    handleSelect={handleSelect} handleExecute={handleExecute} />
            </CardContent>

        </>
    );
});
