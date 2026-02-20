import { useCallback, useContext } from "react";
import { PanesContext } from "./pane/Contexts";
import { Button } from "./ui/Button";
import { Card, CardContent } from "./ui/Card";
import { modalManager } from "../libs/modalManager";
import { ModalMkDir } from "../dialogs/ModalMkDir";
import { VFS } from "../vfs/vfs";
import { useKeyboard } from "./pane/Hooks";
import { DropDrive } from "../vfs/DropDrive";
import { ModalConfirm } from "../dialogs/ModalConfirm";
import { ModalBusy } from "../dialogs/ModalBusy";
import { sleep } from "../libs/utils";
import { clampLocation } from "../libs/location";

function FButton({ fkey, ...props }: {
    fkey: string;
} & React.ComponentProps<"button">) {

    return (
        <Button icon={fkey} className="flex-1 bg-gray-100" {...props}>
            {/* <span className={props.disabled ? 'text-gray-300' : 'text-blue-600'}>{fkey}</span> */}
            {props.children}
        </Button>
    );
}

// Generic footer component that can be used in different contexts
// <AnyFooter actions={"F1": "Help", "F7":"Search", "F10": "Quit"} onAction={(action)=>{...}} />
// keys can be F1-F10
// if no F2 - render disabled empty button
export function AnyFooter({ actions, onAction }: { actions: Record<string, string>, onAction?: (action: string) => void }) {
    const { activePane, setActivePane } = useContext(PanesContext);

    return (
        <Card className=' shrink-0'>
            <CardContent className="justify-between overflow-x-auto -xxhidden shrink-0">

                {Array.from({ length: 10 }, (_, i) => {
                    const fkey = `F${i + 1}`;
                    const label = actions[fkey];
                    return (
                        <FButton
                            key={fkey}
                            fkey={fkey}
                            disabled={!label}
                            onClick={() => label && onAction?.(label)}
                        >
                            {label || '\u00A0'}
                        </FButton>
                    );
                }
                )}

            </CardContent>
        </Card>
    )
}

const filesLabels = ["Help", "Rename", "View", "Edit", "Copy", "Move", "Mkdir", "Delete", "Resize", "Drives"];
const viewLabels = ["Help", "", "", "", "", "", "Search", "", "Resize", "Exit"];
const editLabels = ["Help", "Save", "", "", "", "", "Search", "", "Resize", "Exit"];
const noLabels = ["", "", "", "", "", "", "", "", "", ""];

export function Footer({ onAction }: { onAction?: (action: "mkdir" | "view" | "delete") => void }) {
    const { panes, activeSide, updatePane, setActiveSide, size, setSize } = useContext(PanesContext);
    const activePane = panes[activeSide];
    const hasSelection = !!activePane.selection;
    const targetPane = panes[activeSide === "left" ? "right" : "left"];

    const mode = activePane.mode;
    const targetMode = targetPane.mode;

    const handleResize = useCallback(() => {
        const currentSize = activeSide === "left" ? size : 100 - size;
        let newCurrentSize = 50;
        //(if 25 - go to 50, if 50 - go to 75, if 75 or more - go to 100, if 100 - go to 50)
        if (currentSize <= 25) newCurrentSize = 50;
        else if (currentSize <= 50) newCurrentSize = 75;
        else if (currentSize <= 75) newCurrentSize = 100;
        else newCurrentSize = 50;

        const newSize = activeSide === "left" ? newCurrentSize : 100 - newCurrentSize;
        setSize(newSize);
    }, [activeSide, size, setSize]);

    const handleMkdir = useCallback(async () => {

        function validateFolderName(name: string): boolean {
            name = name.trim();
            if (name.length === 0 || name.length > 255) return false;
            const invalidChars = /[<>:"\/\\|?*\x00-\x1F]/g;
            return !invalidChars.test(name);
        }
        const folderName = await modalManager.showPrompt("New folder name", "new folder 1", validateFolderName, "Create");
        if (!folderName) return;
        await modalManager.showBusy(`Creating ${folderName}...`, async () => {
            //await sleep(2000); //simulate delay
            console.log("CREATED:", folderName);
            try {
                await VFS.mkdir(activePane.location, folderName);
                const files = await VFS.ls(activePane.location);
                updatePane(activeSide, { cursor: folderName, files });
            } catch (err) {
                console.error("Error creating folder:", err);
                await modalManager.showAlert((err as Error).message || "Unknown error", "error");
            }
        });
    }, [activePane.location, activeSide, updatePane]);

    const handleView = useCallback(() => {
        const location = `${activePane.location}/${activePane.selection?.name}`;
        updatePane(activeSide, { location, mode: "view" });
    }, [activePane.location, activePane.selection, activeSide, updatePane]);

    const handleEdit = useCallback(() => {
        const location = `${activePane.location}/${activePane.selection?.name}`;
        updatePane(activeSide, { location, mode: "edit" });
    }, [activePane.location, activePane.selection, activeSide, updatePane]);

    const handleMount = useCallback(() => {
        window.showDirectoryPicker({ startIn: 'desktop', mode: 'readwrite' }).then(async (handle: FileSystemDirectoryHandle) => {
            VFS.registerDrive("DROP", new DropDrive(handle), `User's ${handle.name} folder`);
            updatePane(activeSide, { location: "DROP:", mode: "files", files: undefined, selection: undefined, cursor: undefined, blob: undefined });
        });
    }, [activeSide, updatePane]);
    const handleDelete = useCallback(async () => {
        const location = `${activePane.location}/${activePane.selection?.name}`;
        const todelete = await modalManager.showConfirm(`Are you sure to delete ${location}?`);
        if (todelete) {
            await modalManager.showBusy(`Deleting ${location}...`, async () => {
                try {
                    await VFS.rm(activePane.location, activePane.selection?.name);
                } catch (err) {
                    console.error("Error deleting file:", err);
                    await modalManager.showAlert((err as Error).message || "Unknown error", "error");
                    return;
                }
            });
        }
    }, [activePane.location, activePane.selection]);

    const handleSave = useCallback(async () => {
        if (!activePane.getEditedBlob) return;
        await modalManager.showBusy("Saving...", async () => {
            try {
                const blob = await activePane.getEditedBlob!();
                await VFS.write(activePane.location, blob);
            } catch (err) {
                console.error("Error saving file:", err);
                await modalManager.showAlert((err as Error).message || "Unknown error", "error");
            }
        });
    }, [activePane.getEditedBlob, activePane.location]);

    const handleUp = useCallback(() => {
        const location = clampLocation(`${activePane.location}/..`);
        updatePane(activeSide, { location, mode: "files" });
    }, [activePane.location, activeSide, updatePane]);

    const handleTab = useCallback(() => {
        if (size === 0 || size === 100) return
        setActiveSide((activeSide === "left" ? "right" : "left"));
    }, [activeSide, setActiveSide, size]);

    console.log("PARENT:", activePane.selection)

    let labels = null;
    if (mode === "edit") labels = editLabels;
    else if (mode === "view") labels = viewLabels;
    else if (mode === "files") labels = filesLabels;
    else labels = noLabels;

    const runs = [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined];

    const loading = !activePane.files && !activePane.error && !activePane.blob;
    if (!loading) {
        if (!activePane.error) {

            if (mode === "edit" && activePane.getEditedBlob) runs[1] = handleSave;
            if (mode === "files" && activePane.selection?.kind === "file") runs[2] = handleView;
            if (mode === "files" && activePane.selection?.kind === "file" && !activePane.selection?.readonly) runs[3] = handleEdit;
            if (mode === "files" && !activePane.parent?.readonly) runs[6] = handleMkdir;
            if (mode === "files" && activePane.selection && !activePane.selection?.readonly) runs[7] = handleDelete;

        }
        runs[8] = handleResize;

        if (activePane.location) {
            runs[9] = handleUp;
            labels[9] = "Back";
        } else {
            runs[9] = handleMount;
            labels[9] = "Mount";
        }
    }
    //if (mode === "files" && activePane.selection?.kind === "file" && !activePane.selection?.readonly) runs[3] = handleMkdir;

    useKeyboard({
        F1: runs[0], F2: runs[1], F3: runs[2], F4: runs[3], F5: runs[4],
        F6: runs[5], F7: runs[6], F8: runs[7], F9: runs[8], F10: runs[9],
        Tab: handleTab,
        Escape: runs[9],
    });

    return (
        <Card className='shrink-0' variant={"ready"}>
            <CardContent className="justify-between overflow-hidden gap-1 pr-0">
                {labels.map((label, index) => (
                    <FButton key={index} fkey={`F${index + 1}`} disabled={!runs[index]} onClick={runs[index]}>{label || '\u00A0'}</FButton>
                ))}
            </CardContent>
        </Card>
    )
}