import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { CardContent, CardHeader } from "../ui/Card";
import { blobToTextIfPossible } from "../../libs/utils";
import { usePaneKeyboard } from "./Hooks";
import { Button } from "../ui/Button";
import { PaneContext } from "./Contexts";

export function PaneError({ error, onExit }: { error?: string, onExit?: () => void }) {
    usePaneKeyboard({
        Escape: () => {
            onExit?.();
        },

    });
    return (
        <>
            <CardContent className='px-3 py-1 break-all grid place-items-center text-center'>
                {error}
            </CardContent>

            <CardHeader className="bg-gray-50 block text-center">
                <span className="text-red-500 cursor-pointer hover:opacity-50 animate-pulse" onClick={onExit}>Error</span>
            </CardHeader>
        </>
    )
}