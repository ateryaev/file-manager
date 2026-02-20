import { memo, useCallback, useContext, useEffect, useRef, useState } from "react";
import { FileEntry } from "../../vfs/vfs";
import { CardContent, CardHeader } from "../ui/Card";
import { Counter } from "../RenderCounter";
import { PaneContext } from "./Contexts";
import { usePaneHistory, usePaneKeyboard } from "./Hooks";
import { PaneFileListItem } from "./PaneFilesItem";

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

export const PaneFiles = memo(({ files, onExecute }:
    { files?: FileEntry[], onExecute?: (file: FileEntry) => void }) => {

    const { setHistory, getHistory } = usePaneHistory();
    const { cursor, update } = useContext(PaneContext);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!files || !cursor) return;
        setHistory({ cursor, scroll: scrollRef.current?.scrollTop || 0 });
    }, [cursor, setHistory, files]);

    useEffect(() => {
        if (!files) return;
        let newCursor = getHistory().cursor;
        let newSelection = files.find(file => file.name === newCursor);
        if (!newSelection) {
            newCursor = files[0]?.name || "";
            newSelection = files[0];
        }
        update({ cursor: newCursor, selection: newSelection });
        scrollRef.current && (scrollRef.current.scrollTop = getHistory().scroll || 0);
    }, [files, getHistory]);

    const handleSelect = useCallback((file?: FileEntry) => {
        update({ cursor: file?.name, selection: file });
    }, [update]);

    const handleExecute = useCallback((file: FileEntry, historyUpdate = true) => {
        //if (historyUpdate) 
        setHistory({ cursor: file.name, scroll: scrollRef.current?.scrollTop || 0 });
        onExecute?.(file);
    }, [onExecute, setHistory]);

    const moveCursor = useCallback((delta: number) => {
        if (!files) return;
        const cursorIndex = files.findIndex(file => file.name === cursor);
        let newIndex = cursorIndex + delta;
        if (newIndex < 0) newIndex = 0;
        if (newIndex >= files.length) newIndex = files.length - 1;
        const newCursor = files[newIndex]?.name || "";
        update({ cursor: newCursor, selection: files[newIndex] });
    }, [files, cursor, update, setHistory]);

    usePaneKeyboard({
        ArrowDown: () => {
            moveCursor(1);
        },
        ArrowUp: () => {
            moveCursor(-1);
        },
        ArrowLeft: () => {
            if (!files) return;
            moveCursor(-files.length + 1);
        },
        ArrowRight: () => {
            if (!files) return;
            moveCursor(files.length - 1);
        },

        Escape: () => {
            // setLocation(clampLocation(`${location}/..`));
            if (!files) return;
            handleExecute(files[0], false);
        },
        Enter: () => {
            console.log("ENTER:", cursor);
            if (!files) return;
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
            <CardHeader className="bg-blue-50">
                <div className="w-full flex justify-between items-center">
                    <span className="truncate text-blue-500 hover:text-blue-400 cursor-pointer"
                        onClick={() => handleExecute(files?.find(file => file.name === cursor)!)}>{cursor}</span>
                    &nbsp;
                </div>
            </CardHeader>
        </>
    );
});
