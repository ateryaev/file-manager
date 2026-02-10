import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { CardContent, CardHeader } from "../ui/Card";
import { blobToTextIfPossible } from "../../libs/utils";
import { usePaneKeyboard } from "./Hooks";

export function PaneViewText({ blob, onExit }: { blob?: Blob, onExit?: () => void }) {
    //const { location, parent } = useContext(PaneContext);


    const [text, setText] = useState<string>('Processing...');
    const scrollRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!blob) return;
        async function loadText() {
            const text = await blobToTextIfPossible(blob);
            setText(text ?? 'Error loading text');
        }
        loadText();
    }, [blob]);

    usePaneKeyboard({
        Escape: () => {
            console.log("NAVIGATE:", location);
            onExit?.();
        },
        ArrowUp: () => {
            scrollRef.current?.scrollTo({ top: scrollRef.current?.scrollTop - 10, behavior: 'smooth' });
        },
        ArrowDown: () => {
            scrollRef.current?.scrollTo({ top: scrollRef.current?.scrollTop + 10, behavior: 'smooth' });
        },
        ArrowLeft: () => {
            scrollRef.current?.scrollTo({ left: scrollRef.current?.scrollLeft - 10, behavior: 'smooth' });
        },
        ArrowRight: () => {
            scrollRef.current?.scrollTo({ left: scrollRef.current?.scrollLeft + 10, behavior: 'smooth' });
        },
        Home: () => {
            scrollRef.current?.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
        },
        End: () => {
            scrollRef.current?.scrollTo({ top: scrollRef.current?.scrollHeight, behavior: 'smooth' });
        },
        PageUp: () => {
            scrollRef.current?.scrollTo({ top: scrollRef.current?.scrollTop - 100, behavior: 'smooth' });
        },
        PageDown: () => {
            scrollRef.current?.scrollTo({ top: scrollRef.current?.scrollTop + 100, behavior: 'smooth' });
        },
    });
    return (
        <>
            <CardContent ref={scrollRef} className='whitespace-pre px-3 py-1'>
                {text}
            </CardContent>
            <CardHeader>
                {`${blob?.size} bytes`}
            </CardHeader>
        </>
    )
}