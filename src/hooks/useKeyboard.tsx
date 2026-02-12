import { useEffect } from "react";
//import { modalState } from "../components/Modal";

export function useKeyboard(
    handlers?: { [key: string]: (e: KeyboardEvent) => void },
    enabled: boolean = true,
    modal: boolean = false) {
    useEffect(() => {
        if (!handlers) return;


        const handleKeyDown = (e: KeyboardEvent) => {

            //if (!modal && modalState.isOpen()) return;

            const handler = handlers[e.key];
            if (handler && enabled) {
                handler(e);
                e.preventDefault();
            }

        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handlers, enabled, modal]);
}