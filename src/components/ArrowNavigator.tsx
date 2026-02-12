import { useEffect, useRef, useState } from "react";
import { useKeyboard } from "../hooks/useKeyboard";
//import { useKeyboard } from "../components/pane/Hooks";

interface ArrowNavigatorProps {
    variant?: "vertical" | "horizontal";
    children: React.ReactNode;
    autoFocus?: boolean;
    inmodal?: boolean;
}

export function ArrowNavigator({ variant = "vertical", children, autoFocus = false, inmodal = true }: ArrowNavigatorProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [hasFocus, setHasFocus] = useState(false);

    const getFocusableElements = (): HTMLElement[] => {
        if (!containerRef.current) return [];
        const selector = 'button:not(:disabled), [tabindex]:not([tabindex="-1"])';
        return Array.from(containerRef.current.querySelectorAll(selector));
    };

    const isFocusInside = (): boolean => {
        if (!containerRef.current) return false;
        return containerRef.current.contains(document.activeElement);
    };

    const focusNext = () => {
        const elements = getFocusableElements();
        if (elements.length === 0) return;

        const currentIndex = elements.findIndex(el => el === document.activeElement);
        const nextIndex = (currentIndex + 1) % elements.length;
        elements[nextIndex]?.focus();
    };

    const focusPrevious = () => {
        const elements = getFocusableElements();
        if (elements.length === 0) return;

        const currentIndex = elements.findIndex(el => el === document.activeElement);
        const prevIndex = (currentIndex - 1 + elements.length) % elements.length;
        elements[prevIndex]?.focus();
    };

    const keys: { [key: string]: (e: KeyboardEvent) => void } = variant === "vertical"
        ? { "ArrowDown": focusNext, "ArrowUp": focusPrevious }
        : { "ArrowRight": focusNext, "ArrowLeft": focusPrevious };

    useKeyboard(hasFocus ? keys : undefined, true, inmodal);

    useEffect(() => {
        const handleFocusChange = () => {
            setHasFocus(isFocusInside());
        };

        document.addEventListener('focusin', handleFocusChange);
        document.addEventListener('focusout', handleFocusChange);

        return () => {
            document.removeEventListener('focusin', handleFocusChange);
            document.removeEventListener('focusout', handleFocusChange);
        };
    }, []);

    useEffect(() => {
        if (autoFocus) {
            const elements = getFocusableElements();
            elements[0]?.focus();
        }
    }, [autoFocus]);

    return (
        <div ref={containerRef}>
            {children}
        </div>
    );
}
