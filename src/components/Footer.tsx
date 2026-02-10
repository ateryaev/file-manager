import { useContext } from "react";
import { PanesContext } from "./pane/Contexts";
import { Button } from "./ui/Button";
import { Card, CardContent } from "./ui/Card";
import { modalManager } from "../libs/modalManager";
import { ModalMkDir } from "../dialogs/ModalMkDir";
import { VFS } from "../vfs/vfs";

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

export function Footer({ onAction }: { onAction?: (action: "mkdir" | "view" | "delete") => void }) {
    const { panes, activeSide, updatePane } = useContext(PanesContext);
    const activePane = panes[activeSide];
    const hasSelection = !!activePane.selection;
    const targetPane = panes[activeSide === "left" ? "right" : "left"];

    const mode = activePane.mode;
    const targetMode = targetPane.mode;

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

        async function handleMkdir() {
            const folderName = await modalManager.show<string | null>(ModalMkDir, { defaultValue: "new folder 1" });
            if (folderName) {
                await VFS.mkdir(activePane.location, folderName);
                //setHistory({ cursor: folderName, scroll: scrollRef.current?.scrollTop || 0 });
            }
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