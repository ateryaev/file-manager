import { useEffect } from "react";

export function useKeyboard(active: boolean, handlers: { [key: string]: (e: KeyboardEvent) => void }) {
    useEffect(() => {
        if (!active) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            const handler = handlers[e.key];
            if (handler) {
                handler(e);
                e.preventDefault();
            }
            // preventDefault for all F keys to avoid browser defaults
            if (e.key.startsWith("F") && !isNaN(Number(e.key.substring(1)))) {
                e.preventDefault();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [active, handlers]);
}