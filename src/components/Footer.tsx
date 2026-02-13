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
    const { panes, activeSide, updatePane, setActiveSide } = useContext(PanesContext);
    const activePane = panes[activeSide];
    const hasSelection = !!activePane.selection;
    const targetPane = panes[activeSide === "left" ? "right" : "left"];

    const mode = activePane.mode;
    const targetMode = targetPane.mode;

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

    const handleMount = useCallback(() => {
        window.showDirectoryPicker({ startIn: 'desktop', mode: 'readwrite' }).then(async (handle: FileSystemDirectoryHandle) => {
            VFS.registerDrive("DROP", new DropDrive(handle), `User's ${handle.name} folder`);
            updatePane(activeSide, { location: "DROP:", mode: "files", files: undefined, selection: undefined, cursor: undefined, blob: undefined });
            //setLocation(clampLocation(`${handle.name}://`));
            //navigate(clampLocation(`DROP:`));
            //setHistory({ cursor: "", scroll: scrollRef.current?.scrollTop || 0 });
        });
    }, []);
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
                //await sleep(2000); //simulate delay
                console.log("DELETED:", location);
            });

            //await modalManager.showAlert(`${location} is deleted!`, "info");
            //console.log("DELETED MODAL CLOSED!");
            // await VFS.rm(activePane.location, activePane.selection?.name);
            //setHistory({ cursor: cursor, scroll: scrollRef.current?.scrollTop || 0 }); //TODO: set cursor near deleted file
            //console.log("DELETE:", location, cursor);
        }
    }, [activePane.location, activePane.selection]);
    const handleTab = useCallback(() => {
        setActiveSide((activeSide === "left" ? "right" : "left"));
    }, [activeSide, setActiveSide]);

    console.log("PARENT:", activePane.selection)

    const labels = mode === "files" ? filesLabels : mode === "view" ? viewLabels : noLabels;
    const runs = [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined];
    if (mode === "files" && activePane.location !== "" && !activePane.parent?.readonly) runs[6] = handleMkdir;
    if (mode === "files" && activePane.selection?.kind === "file") runs[2] = handleView;
    if (mode === "files") runs[9] = handleMount;
    if (mode === "files" && activePane.selection && !activePane.selection?.readonly) runs[7] = handleDelete;
    //if (mode === "files" && activePane.selection?.kind === "file" && !activePane.selection?.readonly) runs[3] = handleMkdir;

    useKeyboard({
        F1: runs[0], F2: runs[1], F3: runs[2], F4: runs[3], F5: runs[4],
        F6: runs[5], F7: runs[6], F8: runs[7], F9: runs[8], F10: runs[9],
        Tab: handleTab
    });

    return (
        <Card className='shrink-0' variant={"ready"}>
            <CardContent className="justify-between overflow-hidden gap-1 pr-0">
                {labels.map((label, index) => (
                    <FButton key={index} fkey={`F${index + 1}`} disabled={!runs[index]}>{label || '\u00A0'}</FButton>
                ))}
            </CardContent>
        </Card>
    )


    if (mode === "files") {
        const isUp = activePane.selection?.name === "..";
        const isFolder = activePane.selection?.kind === "directory";
        const isFile = activePane.selection?.kind === "file";
        const isRoot = activePane.location === "";

        const canRename = !isRoot && !isUp && hasSelection;
        const canView = hasSelection && isFile;
        const canEdit = hasSelection && isFile;
        const canCopy = !isRoot && !isUp && hasSelection && targetMode === "files"; //can copy if there's a selection and the other pane is in files mode
        const canMove = !isRoot && canCopy; //same conditions as copy, but also require write permissions which we don't track yet
        const canMkdir = !isRoot; //false if readonly
        const canDelete = !isRoot && !isUp && hasSelection; //false if readonly, or if selection is ".."

        //activePane.selection.kind === "file" ? "view" : "mkdir"

        function handleView() {
            const location = `${activePane.location}/${activePane.selection?.name}`;
            updatePane(activeSide, { location, mode: "view" });
        }



        return (
            <Card className='shrink-0' variant={"ready"}>
                <CardContent className="justify-between overflow-hidden gap-1 pr-0">
                    <FButton fkey="F1">Help</FButton>
                    <FButton fkey="F2" disabled={!canRename}>Rename</FButton>
                    <FButton fkey="F3" disabled={!canView} onClick={handleView}>View</FButton>
                    <FButton fkey="F4" disabled={!canEdit}>Edit</FButton>
                    <FButton fkey="F5" disabled={!canCopy}>Copy</FButton>
                    <FButton fkey="F6" disabled={!canMove}>Move</FButton>
                    <FButton fkey="F7" disabled={!canMkdir} onClick={handleMkdir}>Mkdir</FButton>
                    <FButton fkey="F8" disabled={!canDelete}>Delete</FButton>
                    <FButton fkey="F9" disabled={false}>Expand</FButton>
                    <FButton fkey="F10">Drives</FButton>
                </CardContent>
            </Card>
        )
    }
    if (mode === "view") {
        return (
            <Card className='shrink-0'>
                <CardContent className="justify-between overflow-hidden gap-1 pr-0">
                    <FButton fkey="F1">Help</FButton>
                    <FButton fkey="F2" disabled>Save</FButton>
                    <FButton fkey="F3" disabled></FButton>
                    <FButton fkey="F4" disabled></FButton>
                    <FButton fkey="F5" disabled></FButton>
                    <FButton fkey="F6" disabled></FButton>
                    <FButton fkey="F7">Search</FButton>
                    <FButton fkey="F8" disabled></FButton>
                    <FButton fkey="F9">Resize</FButton>
                    <FButton fkey="F10">Exit</FButton>
                </CardContent>
            </Card>
        )
    }
}