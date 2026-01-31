import { useContext, useEffect, useRef, useState } from "react";
import { CardContent, CardHeader } from "../ui/Card";
import { blobToTextIfPossible } from "../../libs/utils";
import { PaneContext, usePaneKeyboard } from "./PaneContext";
import { clampLocation } from "../../libs/location";

export function ViewTextFile({ }) {
    const { location, setLocation, fileInfo, fileBlob } = useContext(PaneContext);
    const [text, setText] = useState<string>('Loading...');
    const scrollRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (fileBlob === null) return;
        async function loadText() {
            const text = await blobToTextIfPossible(fileBlob);
            setText(text ?? 'Error loading text');
        }
        loadText();
    }, [location, fileInfo, fileBlob]);

    usePaneKeyboard({
        Escape: () => {
            console.log("NAVIGATE:", location);
            setLocation(clampLocation(`${location}/..`));
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
            <CardContent ref={scrollRef} className='whitespace-pre'>
                {text}
            </CardContent>
            <CardHeader>
                {`${fileInfo?.lastModified?.toLocaleString()} ${fileInfo?.size} bytes`}
            </CardHeader>
        </>
    )
}