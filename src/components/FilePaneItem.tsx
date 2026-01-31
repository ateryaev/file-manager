import { memo, useEffect, useRef } from "react";
import { usePaneStore } from "../hooks/usePaneStore";
import { cn, formatBytes, formatDate, formatTime } from "../libs/utils";
import { FileEntry } from "../vfs/vfs";
import { IconFile, IconFileDescription, IconFileFilled, IconFileText, IconFileTextFilled, IconFolder, IconFolderFilled, IconFolderUp } from "@tabler/icons-react";

export const FilePaneItem = memo(function FilePaneItem({
    file,
    paneIndex,
    onExecute
}: { file: FileEntry; paneIndex: number; onExecute?: (file: FileEntry) => void }) {
    const selectedRef = useRef<HTMLDivElement>(null);

    const isSelected = usePaneStore(s => s.panes?.[paneIndex]?.cursorHistory[s.panes?.[paneIndex]?.location] === file.name);

    function handleSelect() {
        usePaneStore.getState().setCursor(paneIndex, file.name);
        usePaneStore.getState().setCursorHistory(paneIndex, file.name);
    }

    useEffect(() => {
        if (!isSelected) return;
        selectedRef.current?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "instant" });
    }, [isSelected]);

    const renderCount = useRef(0);
    renderCount.current++;
    console.log(`__RENDER_ITEM_${paneIndex}: ${renderCount.current} (${file.name})`);

    const size = file.kind === "file" ? `${formatBytes(file.size || 0)}` :
        file.name === ".." ? "Up" : "Folder";

    //let icon = file.kind === "directory" ? "📁" : "📄";

    const iconsize = "1em";
    let icon = file.kind === "directory" ?
        <IconFolderFilled size={iconsize} className="text-yellow-400 shrink-0" /> :
        <IconFile size={iconsize} opacity={0.2} className="shrink-0" />;
    if (file.name === "..") icon = <IconFolderUp size={iconsize} className="text-yellow-400 shrink-0" />;

    return (
        <div
            ref={selectedRef}
            className={cn("@container",
                "px-2 py-1 flex flex-between items-center select-none gap-4 hover:opacity-80 overflow-hidden shrink-0",
                "starting:opacity-0 transition-opacity duration-100",
                isSelected && "bg-gray-200 text-black",
                isSelected && "group-[.readycard]:bg-blue-400 group-[.readycard]:text-white",
            )}
            onDoubleClick={() => onExecute?.(file)}
            onMouseDown={handleSelect}
        >

            <div className="hidden @[100px]:block">{icon}</div>
            <div className="flex-1 truncate">
                {file.name}
            </div>
            <div className="hidden @[300px]:block">{size}</div>
            <div className="hidden @[400px]:block">{formatDate(file.lastModified)}</div>
            <div className="hidden @[500px]:block">{formatTime(file.lastModified)}</div>

        </div>
    );
});
