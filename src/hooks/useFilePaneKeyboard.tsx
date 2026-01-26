import { useKeyboard } from "./useKeyboard";
import { usePaneStore } from "./usePaneStore";
import { FileEntry } from "../vfs/vfs";

export function useFilePaneKeyboard(
    active: boolean,
    paneIndex: number,
    items: FileEntry[],
    onExecute?: (file: FileEntry) => void
) {
    function moveCursor(delta: number) {
        const paneState = usePaneStore.getState();
        const currentCursor = paneState.getCursor(paneIndex);
        const currentIndex = items.findIndex(item => item.name === currentCursor);
        let newIndex = currentIndex + delta;
        if (newIndex < 0) newIndex = 0;
        if (newIndex >= items.length) newIndex = items.length - 1;
        const newCursor = items[newIndex]?.name || "";
        paneState.setCursor(paneIndex, newCursor);
    }

    useKeyboard(active, {
        ArrowDown: () => {
            moveCursor(1);
        },
        ArrowUp: () => {
            moveCursor(-1);
        },
        ArrowLeft: () => {
            moveCursor(-items.length + 1);
        },
        ArrowRight: () => {
            moveCursor(items.length - 1);
        },
        PageDown: () => {
            moveCursor(10);
        },
        PageUp: () => {
            moveCursor(-10);
        },
        Enter: () => {
            const currentCursor = usePaneStore.getState().getCursor(paneIndex);
            const file = items.find(item => item.name === currentCursor);
            if (file) {
                onExecute?.(file);
            }
        }
    });
}
