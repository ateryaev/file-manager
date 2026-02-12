import { useCallback, useContext, useEffect } from "react";
import { PaneContext, Side } from "./Contexts";
import { modalManager } from "../../libs/modalManager";

const allHistory = { left: {}, right: {} } as Record<Side, Record<string, any>>;

export function usePaneHistory() {
    const { side, location } = useContext(PaneContext) as { side: Side, location: string };
    const getHistory = useCallback(() => {
        return allHistory[side][location] || {};
    }, [side, location]);
    const setHistory = useCallback((history: any) => {
        allHistory[side][location] = history;
    }, [side, location]);
    return { getHistory, setHistory };
}


export function usePaneKeyboard(handlers: Record<string, (e: KeyboardEvent) => void>) {
    const { isActive } = useContext(PaneContext);

    useEffect(() => {
        if (!isActive) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (modalManager.isShowing()) return;
            const handler = handlers[e.key];
            if (!handler) return;
            handler(e);
            e.preventDefault();
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [isActive, handlers]);
}




export function useKeyboard(handlers: Record<string, undefined | ((e: KeyboardEvent) => void)>) {

    useEffect(() => {

        const onKeyDown = (e: KeyboardEvent) => {
            if (modalManager.isShowing()) return;
            const handler = handlers[e.key];
            if (!handler) return;
            handler(e);
            e.preventDefault();
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [handlers]);
}
