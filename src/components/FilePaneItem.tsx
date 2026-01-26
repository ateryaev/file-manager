import { memo, useEffect, useRef } from "react";
import { usePaneStore } from "../hooks/usePaneStore";
import { cn, formatBytes, formatTime } from "../libs/utils";
import { FileEntry } from "../vfs/vfs";

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

    let icon = file.kind === "directory" ? "📁" : "📄";
    //if (file.name === "..") icon = "⬆️"//"⬆️";

    // let icon = file.kind === "directory" ? "[+]" : "[-]";
    // if (file.name === "..") icon = "[^]";

    return (
        <div
            ref={selectedRef}
            className={cn(
                "px-2 py-1 flex flex-between select-none gap-4 hover:opacity-80",
                "starting:opacity-0 transition-opacity duration-100",
                isSelected && "bg-gray-200 text-black",
                isSelected && "group-[.activepane]:bg-blue-500 group-[.activepane]:text-white",
            )}
            onDoubleClick={() => onExecute?.(file)}
            onMouseDown={handleSelect}
        >
            <span className="flex-1 truncate whitespace-nowrap">{icon} {file.name}</span>
            <span>{size}</span>
            <span>{formatTime(file.lastModified)}</span>

        </div>
    );
});
