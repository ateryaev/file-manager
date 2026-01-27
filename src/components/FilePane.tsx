import { useEffect, useRef, memo, useCallback, useState, use } from "react";
import { Card, CardContent, CardHeader } from "./ui/Card";
import { cn } from "../libs/utils";
import { FileEntry, VFS } from "../vfs/vfs";
import { usePaneStore } from "../hooks/usePaneStore";
import { FilePaneItem } from "./FilePaneItem";
import { useFilePaneKeyboard } from "../hooks/useFilePaneKeyboard";
import { clampLocation } from "../libs/location";

export const FilePane = memo(function FilePane({ paneIndex, ...props }: {
    paneIndex: number;
    // onExecute?: (file: FileEntry) => void;
} & React.ComponentProps<"div">) {

    const scrollRef = useRef<HTMLDivElement>(null);

    const paneLocation = usePaneStore(s => s.panes?.[paneIndex]?.location || "RAM://tests");
    const active = usePaneStore(s => s.activePane === paneIndex);
    const [items, setItems] = useState<FileEntry[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        setLoading(true);
        //setItems([]);
        VFS.ls(paneLocation).then(fetchedItems => {
            //fetchedItems.location = paneLocation;
            setItems(fetchedItems);
        });
        return VFS.subscribe(paneLocation, () => {
            console.log("VFS change detected for location:", paneLocation);
            VFS.ls(paneLocation).then(fetchedItems => {
                //fetchedItems.location = paneLocation;
                setItems(fetchedItems);
            });
        });
    }, [paneLocation]);

    useEffect(() => {
        setLoading(false);
    }, [items]);

    useEffect(() => {
        if (loading) return;

        // Restore scroll position and cursor from history
        const savedScrollTop = usePaneStore.getState().getScrollHistory(paneIndex);
        const savedCursor = usePaneStore.getState().getCursorHistory(paneIndex);
        usePaneStore.getState().setCursor(paneIndex, savedCursor);
        scrollRef.current && (scrollRef.current.scrollTop = savedScrollTop);

        // Listen to scroll events and store scrollTop for current location
        const scrollElement = scrollRef.current;
        if (!scrollElement) return;
        const handleScroll = () => {
            usePaneStore.getState().setScrollHistory(paneIndex, scrollElement.scrollTop);
        };
        scrollElement.addEventListener('scroll', handleScroll);
        return () => scrollElement.removeEventListener('scroll', handleScroll);
    }, [paneLocation, items, loading]);

    const handleExecute = useCallback(async (file: FileEntry) => {
        if (file.kind === "directory") {
            const currentLocation = usePaneStore.getState().getLocation(usePaneStore.getState().activePane);
            usePaneStore.getState().setLocation(usePaneStore.getState().activePane,
                clampLocation(`${currentLocation}/${file.name}`));
        }
        console.log("HANDLE EXECUTE:", file);
    }, []);

    useFilePaneKeyboard(active, paneIndex, items, handleExecute);

    console.log(`RENDER PANE ${paneIndex} : ${paneLocation}`);

    return (
        <Card className={cn('flex-1')} variant={active ? 'ready' : 'blur'} {...props}>
            <CardHeader label="files">
                {paneLocation}
            </CardHeader>
            <CardContent ref={scrollRef} className='flex flex-col gap-0 cursor-default '>

                {!loading && items.map((file) => (
                    <FilePaneItem key={paneLocation + file.name}
                        paneIndex={paneIndex}
                        file={file}
                        onExecute={handleExecute}
                    />
                ))}
            </CardContent>
        </Card>
    );
});
