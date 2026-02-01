import { memo, useEffect, useRef } from "react";
import { FileEntry } from "../../vfs/vfs";
import { cn, formatBytes, formatDate, formatTime } from "../../libs/utils";
import { IconDeviceFloppy, IconFile, IconFolderFilled, IconFolderUp } from "@tabler/icons-react";
import { Counter } from "../RenderCounter";

export const PaneFileListItem = memo(function PaneFileListItem({ onExecute, onSelect, file, selected = false, className }:
    {
        onSelect?: (name: string) => void,
        onExecute?: (name: string) => void,
        file: FileEntry,
        selected?: boolean,
        className?: string
    }) {
    const selectedRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        selectedRef.current?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "instant" });
    }, [selected]);

    const size = file.kind === "file" ? `${formatBytes(file.size || 0)}` :
        file.name === ".." ? "Up" : "Folder";
    const iconsize = "1em";
    let icon = file.kind !== "file" ?
        <IconFolderFilled size={iconsize} className="text-yellow-400 shrink-0" /> :
        <IconFile size={iconsize} opacity={0.2} className="shrink-0" />;
    if (file.name === "..") icon = <IconFolderUp size={iconsize} className="text-yellow-400 shrink-0" />;
    if (file.kind === "drive") icon = <IconDeviceFloppy size={iconsize} className="text-blue-700 shrink-0" />

    return (
        <div className={cn(
            "@container px-3 py-1 flex flex-between items-center select-none gap-4 hover:opacity-80 overflow-hidden shrink-0",
            "starting:opacity-0 transition-opacity duration-150",
            selected && "bg-blue-300", className)}
            onMouseDown={() => onSelect?.(file.name)}
            onDoubleClick={() => onExecute?.(file.name)}
            ref={selected ? selectedRef : null}>

            <div className="hidden @[100px]:block">{icon}</div>
            <div className="flex-1 truncate">
                {file.name}<Counter />
            </div>
            <div className="hidden @[300px]:block">{size}</div>
            <div className="hidden @[400px]:block">{formatDate(file.lastModified)}</div>
            <div className="hidden @[500px]:block">{formatTime(file.lastModified)}</div>
        </div>
    );
})