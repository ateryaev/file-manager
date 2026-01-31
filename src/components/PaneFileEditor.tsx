import { memo, useEffect, useRef, useState } from "react";
import { useKeyboard } from "../hooks/useKeyboard";
import { FileEntry, VFS } from "../vfs/vfs";
import { clampLocation } from "../libs/location";
import { blobToHexView, blobToTextIfPossible, hasNonTextCharsInStart, isImage } from "../libs/utils";
import { CardContent, CardHeader } from "./ui/Card";


//const hasNonTextChars = await hasNonTextCharsInStart(blob);

function ImageViewer({ blob }: { blob: Blob }) {

    const [imageUrl, setImageUrl] = useState<string | null>(null);
    useEffect(() => {
        async function loadImage() {
            const imageUrl = URL.createObjectURL(blob);
            setImageUrl(imageUrl);
        }
        loadImage();
    }, [blob]);
    return <img src={imageUrl ?? undefined} alt="Image" className="max-w-full max-h-full object-contain" />;
}

function TextViewer({ blob }: { blob: Blob }) {
    const [text, setText] = useState<string>('Loading...');
    useEffect(() => {
        async function loadText() {
            const text = await blobToTextIfPossible(blob);
            setText(text ?? 'Error loading text');
        }
        loadText();
    }, [blob]);
    return <>{text}</>;
}

function HexViewer({ blob }: { blob: Blob }) {
    const [hex, setHex] = useState<string>('Loading...');
    useEffect(() => {
        async function loadHex() {
            const hex = await blobToHexView(blob, 0, 1024 * 1024);
            setHex(hex);
        }
        loadHex();
    }, [blob]);

    return <div className="whitespace-pre">{hex}</div>;
}

export const PaneFile = memo(({ location, active = true, onNavigate }: { location: string, active?: boolean, onNavigate?: (location: string) => void }) => {
    const [content, setContent] = useState<React.ReactNode>('Loading...');
    const [status, setStatus] = useState<'loading' | 'error' | 'ready'>('loading');
    const scrollRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        async function loadContent() {

            setStatus('loading');
            try {
                const blob = await VFS.read(location + "");
                const img = await isImage(blob);
                if (img) {
                    setContent(<ImageViewer blob={blob} />);
                    setStatus('ready');
                    return;
                }
                const hasNonTextChars = await hasNonTextCharsInStart(blob);
                if (hasNonTextChars) {
                    setContent(<HexViewer blob={blob} />);
                    setStatus('ready');
                    return;
                }
                setContent(<TextViewer blob={blob} />);
                setStatus('ready');
                return;
            } catch (error) {
                setContent(`Error loading file: ${error}`)
                setStatus('error');
            }
            //scrollRef.current?.tri focus();
        }
        loadContent()
    }, [location])

    useKeyboard({
        Escape: () => {
            console.log("NAVIGATE:", location);
            onNavigate?.(clampLocation(`${location}/..`));
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
    }, active);

    return (
        <>
            <CardContent ref={scrollRef} className='whitespace-pre'>
                {content}
            </CardContent>
            <CardHeader>
                1024 bytes
                modified:2026-01-30 12:00:00
            </CardHeader>
        </>

    );
});
