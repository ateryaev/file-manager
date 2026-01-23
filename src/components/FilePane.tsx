import { useEffect, useRef, memo, useCallback } from "react";
import { Card, CardContent, CardHeader } from "./ui/Card";
import { cn } from "../libs/utils";
import { useCommanderStore } from "../hooks/useCommanderStore";
import { useKeyboard } from "../hooks/useKeyboard";
import { FileEntry } from "../vfs/vfs";

// 1. Wrap in React.memo
const FilePaneItem = memo(function FilePaneItem({
    file,
    paneIndex,
    index,
    onExecute
}: any) {
    const selectedRef = useRef<HTMLDivElement>(null);

    const isSelected = useCommanderStore(s => s.panes[paneIndex]?.selectedIndex === index);
    const setSelectedIndex = useCommanderStore(s => s.setSelectedIndex);

    useEffect(() => {
        isSelected &&
            selectedRef.current?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "instant" });
    }, [isSelected]);

    const renderCount = useRef(0);
    renderCount.current++;
    console.log(`__RENDER_ITEM_${paneIndex}: ${renderCount.current} (${file.name})`);

    return (
        <div
            ref={selectedRef}
            className={cn(
                "px-2 py-1 flex flex-between select-none gap-4  hover:opacity-80 group-[.activepane]:opacity-100",
                isSelected && "bg-gray-200 text-black",
                isSelected && "group-[.activepane]:bg-blue-500 group-[.activepane]:text-white",
            )}

            onDoubleClick={() => onExecute(index)}
            onMouseDown={() => setSelectedIndex(paneIndex, index)}
        >
            <span className="flex-1 truncate whitespace-nowrap">{file.kind === "directory" ? "📁" : "📄"} {file.name}</span>
            <span>{file.size ? `${file.size} bytes` : "Folder"}</span>
            <span>{file.lastModified ? new Date(file.lastModified).toLocaleString() : "??/??/????, XX:XX:??"}</span>

        </div>
    );
});

export const FilePane = memo(function FilePane({ paneIndex, location = "RAM://", onExecute, ...props }: {
    paneIndex: number;
    location: string;
    onExecute?: (file: FileEntry, scrollTop?: number) => void;
} & React.ComponentProps<"div">) {



    const focusedPane = useCommanderStore(s => s.focusedPane);
    const active = (focusedPane === paneIndex);

    const items = useCommanderStore(s => s.panes[paneIndex]?.items || []);
    const scrollTop = useCommanderStore(s => s.panes[paneIndex]?.history[location]?.scrollTop || 0);
    const moveSelection = useCommanderStore(s => s.moveSelection);
    const modalActionOngoing = useCommanderStore(s => s.currentDialog !== null);
    const getSelectedIndex = useCommanderStore(s => s.getSelectedIndex);

    const scrollRef = useRef<HTMLDivElement>(null);

    const renderCount = useRef(0);
    renderCount.current++;
    console.log(`RENDER_PANE_${paneIndex}: ${renderCount.current}`);

    useEffect(() => {
        console.log(`Render PANE ${paneIndex} - ScrollTop: ${scrollTop} `);
        scrollRef.current!.scrollTop = scrollTop;
    }, [location, items, scrollTop]);


    const handleExecute = useCallback(async (index: number) => {
        const scrollTop = scrollRef.current?.scrollTop;
        const file = items[index];
        onExecute?.(file, scrollTop);
    }, [items, paneIndex]);

    useKeyboard(active && !modalActionOngoing, {
        ArrowDown: (e) => {
            moveSelection(paneIndex, 1);
        },
        ArrowUp: (e) => {
            moveSelection(paneIndex, -1);
        },
        Enter: (e) => {
            const selectedIndex = getSelectedIndex(paneIndex);
            handleExecute(selectedIndex);
        }
    });

    return (
        <Card className={cn('flex-1', active && "group activepane")}  {...props} variant={active ? 'ready' : 'blur'}>
            <CardHeader label="files">
                {location}
            </CardHeader>
            <CardContent ref={scrollRef} className='flex flex-col gap-0 cursor-default '>
                {items.map((file, index) => (
                    <FilePaneItem key={index}
                        paneIndex={paneIndex}
                        index={index}
                        file={file}
                        onExecute={handleExecute}
                    />
                ))}
            </CardContent>
        </Card>
    );
});
