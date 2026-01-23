import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader } from "./ui/Card";
import { cn } from "../libs/utils";
import { clampLocation } from "../libs/location";
import { useCommanderStore } from "../hooks/useCommanderStore";
import { useKeyboard } from "../hooks/useKeyboard";

export function FilePane({ paneIndex, startLocation = "RAM://", onExecute, ref, ...props }: {
    paneIndex: number;
    startLocation: string;
    onExecute?: (location: string) => void;
} & React.ComponentProps<"div">) {


    const focusedPane = useCommanderStore(s => s.focusedPane);
    const active = (focusedPane === paneIndex);
    const pane = useCommanderStore(s => s.panes[paneIndex]);
    const navigate = useCommanderStore(s => s.navigate);
    const setSelectedIndex = useCommanderStore(s => s.setSelectedIndex);
    const modalActionOngoing = useCommanderStore(s => s.currentDialog !== null);

    const selectedRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    function handleSelect(index: number) {
        setSelectedIndex(paneIndex, index);
    }

    async function handleExecute(index: number) {
        const file = pane.items[index];
        const name = file.name;
        if (file.kind === "file") {
            onExecute?.(clampLocation(`${pane.location}/${name}`));
            return;
        } else if (file.kind === "directory") {
            const scrollTop = scrollRef.current?.scrollTop ?? 0;
            const newScrollTop = await navigate(paneIndex, clampLocation(`${pane.location}/${name}`), scrollTop);
            scrollRef.current!.scrollTop = newScrollTop;
        }
    }

    useEffect(() => {
        selectedRef.current?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "instant" });
    }, [pane.selectedIndex]);

    useKeyboard(active && !modalActionOngoing, {
        ArrowDown: (e) => {
            handleSelect(Math.min((pane.selectedIndex ?? 0) + 1, pane.items.length - 1));
        },
        ArrowUp: (e) => {
            handleSelect(Math.max((pane.selectedIndex ?? 0) - 1, 0));
        },
        Enter: (e) => {
            handleExecute(pane.selectedIndex ?? 0);
        }
    });

    // useEffect(() => {
    //     if (!active) return;
    //     if (modalActionOngoing) return;

    //     const handleKeyDown = (e: KeyboardEvent) => {
    //         if (e.key === "ArrowDown") {
    //             handleSelect(Math.min((pane.selectedIndex ?? 0) + 1, pane.items.length - 1));
    //             e.preventDefault();
    //         }
    //         if (e.key === "ArrowUp") {
    //             handleSelect(Math.max((pane.selectedIndex ?? 0) - 1, 0));
    //             e.preventDefault();
    //         }
    //         if (e.key === "Enter") {
    //             handleExecute(pane.selectedIndex ?? 0);
    //             e.preventDefault();
    //         }
    //     };

    //     window.addEventListener('keydown', handleKeyDown);
    //     return () => window.removeEventListener('keydown', handleKeyDown);
    // }, [active, pane.selectedIndex, pane.items.length, modalActionOngoing]);

    return (
        <Card className={cn('flex-1')}  {...props} variant={active ? 'ready' : 'blur'}>
            <CardHeader label="files">
                {pane.location}
            </CardHeader>
            <CardContent ref={scrollRef} className='flex flex-col gap-0 cursor-default'>
                {pane.items.map((file, index) => (
                    <div key={index} className={cn("px-2 py-1 hover:opacity-80",
                        "flex flex-between select-none gap-4",
                        active && (pane.selectedIndex === index) && "bg-blue-500 text-white",
                        !active && (pane.selectedIndex === index) && "bg-gray-200 text-whitex",
                    )}
                        onMouseDown={() => handleSelect(index)}
                        ref={pane.selectedIndex === index ? selectedRef : null}
                        onDoubleClick={() => handleExecute(index)}
                    >
                        <span className="flex-1 truncate whitespace-nowrap">{file.kind === "directory" ? "📁" : "📄"} {file.name}</span>
                        <span>{file.size ? `${file.size} bytes` : "Folder"}</span>
                        <span>{file.lastModified ? new Date(file.lastModified).toLocaleString() : "??/??/????, XX:XX:??"}</span>
                    </div>
                ))}
            </CardContent>
        </Card >
    );
}