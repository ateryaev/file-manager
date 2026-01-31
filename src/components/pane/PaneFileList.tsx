import { memo, useCallback, useContext, useEffect, useRef, useState } from "react";
import { FileEntry, VFS } from "../../vfs/vfs";
import { CardContent } from "../ui/Card";
import { Counter } from "../RenderCounter";
import { PaneContext, usePaneKeyboard } from "./PaneContext";
import { clampLocation } from "../../libs/location";
import { PaneFileListItem } from "./FileListItem";
import { modalManager } from "../../libs/modalManager";
import { ModalMkDir } from "../../dialogs/ModalMkDir";
import { ModalConfirm } from "../../dialogs/ModalConfirm";
import { DropDrive } from "../../vfs/DropDrive";

const PaneFileListItems = memo(({ files, cursor, setCursor, handleExecute }:
    { files: FileEntry[], cursor: string, setCursor: (name: string) => void, handleExecute: (name: string) => void }) => {
    return (
        <>
            <Counter />
            {files.map((file) => (
                <PaneFileListItem
                    key={file.name}
                    file={file}
                    selected={file.name === cursor}
                    onSelect={setCursor}
                    onExecute={handleExecute}
                />
            ))}
        </>
    );
});

export const PaneFileList = memo(function PaneFileList() {
    console.log("Rendering PANE FILE LIST");
    const { location, setLocation, setHistory, getHistory, files } = useContext(PaneContext);

    const scrollRef = useRef<HTMLDivElement>(null);
    const [cursor, setCursor] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (files.length === 0) return;
        //console.log("getHistory:", location, getHistory(), files.length);
        setCursor(getHistory().cursor || files[0]?.name);
        scrollRef.current && (scrollRef.current.scrollTop = getHistory().scroll || 0);
    }, [files, getHistory]);

    const handleExecute = useCallback((name: string, historyUpdate = true) => {
        console.log("SET HISTORY 2:", location, name);
        if (historyUpdate) setHistory({ cursor: name, scroll: scrollRef.current?.scrollTop || 0 });
        setLocation(clampLocation(`${location}/${name}`));
    }, [location, setLocation, setHistory]);

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
        F7: async (e) => {

            const folderName = await modalManager.show<string | null>(ModalMkDir, { defaultValue: "new folder 1" });
            if (folderName) {
                await VFS.mkdir(location, folderName);
                setHistory({ cursor: folderName, scroll: scrollRef.current?.scrollTop || 0 });
            }
        },
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
                VFS.registerDrive(handle.name, new DropDrive(handle));
                setLocation(clampLocation(`${handle.name}://`));
                //setHistory({ cursor: "", scroll: scrollRef.current?.scrollTop || 0 });
            });
        },
        Escape: () => {
            // setLocation(clampLocation(`${location}/..`));
            handleExecute("..", false);
        },
        Enter: () => {
            const file = files.find(file => file.name === cursor) || files[0];
            handleExecute(file.name);
        }
    });

    return (
        <CardContent ref={scrollRef} className='flex flex-col gap-0 cursor-default '>
            <PaneFileListItems files={files} cursor={cursor || ""}
                setCursor={setCursor} handleExecute={handleExecute} />
        </CardContent>
    );
});
