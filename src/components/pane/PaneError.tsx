import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { CardContent, CardHeader } from "../ui/Card";
import { blobToTextIfPossible } from "../../libs/utils";
import { usePaneKeyboard } from "./Hooks";
import { Button } from "../ui/Button";
import { PaneContext } from "./Contexts";

export function PaneError({ error, onExit }: { error?: string, onExit?: () => void }) {
    const { location } = useContext(PaneContext);

    usePaneKeyboard({
        Escape: () => {
            onExit?.();
        },

    });
    return (
        <>
            <CardContent className=' px-3 py-1 whitespace-normalx break-all text-gray-500'>
                {error}
            </CardContent>
            <CardHeader key={location}
                className="starting:bg-blue-100 cursor-pointer bg-gray-100 hover:bg-blue-100 transition-all"
                onClick={onExit}>
                <div className="w-full flex justify-between items-center">
                    Up
                    <span className="text-blue-500">Escape</span>
                </div>
            </CardHeader>
        </>
    )
}