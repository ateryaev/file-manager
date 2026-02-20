import { useCallback, useEffect, useRef, useState } from "react";

import { CardContent, CardHeader } from "../ui/Card";
import { blobToTextIfPossible, sleep } from "../../libs/utils";

export function PaneEditText({ blob, focused, onUpdate }: { blob: Blob, focused: boolean, onUpdate: (getBlob?: () => Blob) => void }) {

    const [blobText, setBlobText] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;
        if (!focused) { textarea.blur(); return; }
        const focus = () => { setTimeout(() => textarea.focus(), 0); };
        focus();
        textarea.addEventListener("blur", focus);
        return () => { textarea.removeEventListener("blur", focus); };
    }, [focused]);

    const setChanged = useCallback((changed: boolean) => {
        //onUpdate(undefined);

        if (changed) {
            onUpdate(() => {
                if (!textareaRef.current) return blob;
                return new Blob([textareaRef.current.value], { type: blob.type });
            });
        } else {
            onUpdate(undefined);
        }
    }, [blob, onUpdate]);

    useEffect(() => {
        setChanged(false);

        if (!blob) return;
        async function blobToText() {
            const loadedText = await blobToTextIfPossible(blob);
            await sleep(200); // Simulate loading time
            if (loadedText === null) {
                setError("Failed to load text from blob");
                return;
            }
            setBlobText(loadedText);
        }
        blobToText();
    }, [blob]);

    useEffect(() => {
        if (textareaRef.current!.value !== "") {
            handleChange();
            return;
        }
        textareaRef.current!.value = blobText || "";
        setChanged(false);
    }, [blobText, setChanged]);

    const handleChange = useCallback(() => {
        setChanged(blobText !== textareaRef.current!.value);
    }, [setChanged, blobText]);

    const byteSize = blob ? blob.size : 0;

    if (error) {
        return (
            <CardContent className="p-3">
                <span className="text-red-500">{error}</span>
            </CardContent>
        );
    }

    return (
        //<FocusTrap active={true} focusTrapOptions={{ escapeDeactivates: false, allowOutsideClick: true }}>
        <div className="contents">
            <CardContent className="p-0 flex flex-col">
                <textarea
                    ref={textareaRef}
                    defaultValue={""}
                    readOnly={blobText === null}
                    onChange={handleChange}
                    spellCheck={false}
                    className="flex-1 resize-none w-full h-full bg-transparent px-3 py-1
                        whitespace-pre outline-none
                        [&::-webkit-scrollbar-thumb]:bg-gray-300
                        [&::-webkit-scrollbar]:size-2
                        [&::-webkit-scrollbar]:bg-gray-100"
                />
            </CardContent>
            <CardHeader>
                <span>{`${byteSize} bytes`}</span>
            </CardHeader>
        </div>
        //</FocusTrap>
    );
}
