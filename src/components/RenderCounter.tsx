import { useRef } from "react";
import { cn } from "../libs/utils";

export function Counter({ className }: { className?: string }) {
    const count = useRef(1);
    const renderCount = count.current;
    count.current++;
    return null; //disable
    return (
        <div className={cn("inline-block text-xs text-gray-500 bg-white/50", className)}>{renderCount}</div>
    );
}