import { memo, useEffect, useRef } from "react";
import { FileEntry } from "../../vfs/vfs";
import { cn, formatBytes, formatDate, formatTime } from "../../libs/utils";
import { IconArrowBigUp, IconArrowBigUpFilled, IconDeviceFloppy, IconFile, IconFile3d, IconFileText, IconFolderFilled, IconFolderUp, IconSquare, IconSquareFilled } from "@tabler/icons-react";
import { Counter } from "../RenderCounter";

export const PaneFileListItem = memo(function PaneFileListItem({ onExecute, onSelect, file, selected = false, className }:
    {
        onSelect?: (file: FileEntry) => void,
        onExecute?: (file: FileEntry) => void,
        file: FileEntry,
        selected?: boolean,
        className?: string
    }) {
    const selectedRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        selectedRef.current?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "instant" });
    }, [selected]);

    const size = `${formatBytes(file.size || 0)}`;

    const iconsize = "1em";
    let icon = file.kind !== "file" ?
        <IconFolderFilled size={iconsize} className={cn("text-yellow-300 shrink-0", selected && "text-white/50")} /> :
        <IconFileText size={iconsize} className={cn("text-blue-300 shrink-0", selected && "text-white/50")} />;
    if (file.name === "..") icon = <IconArrowBigUp size={iconsize} className={cn("text-blue-300 shrink-0", selected && "text-white/50")} />;
    if (file.kind === "drive") icon = <IconDeviceFloppy size={iconsize} className={cn("text-blue-300 shrink-0", selected && "text-white/50")} />

    return (
        <div className={cn(
            "@container px-2 py-1 flex flex-between items-center select-none gap-2 hover:opacity-80 overflow-hidden shrink-0",
            "starting:opacity-0 transition-opacity duration-150",
            selected && "bg-blue-300 text-white", className)}
            onMouseDown={() => onSelect?.(file)}
            onDoubleClick={() => onExecute?.(file)}
            ref={selected ? selectedRef : null}>

            {icon && <div className="hidden @[100px]:block">{icon}</div>}
            <div className="flex-1 truncate">
                {file.name}
                {file.kind === "drive" && <span className="opacity-50"> {file.description}</span>}
            </div>

            <div className="hidden @[300px]:block truncate">
                {file.kind === "file" && size}
                {file.kind === "directory" && file.name !== ".." && "Folder"}
                {file.name === ".." && "Up"}
                {file.kind === "drive" && "Drive"}
            </div>

            {file.lastModified && <><div className="hidden @[400px]:block">{formatDate(file.lastModified)}</div>
                <div className="hidden @[500px]:block">{formatTime(file.lastModified)}</div></>}
        </div>
    );
})