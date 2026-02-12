import { useContext, useEffect, useState } from "react";
import { Modal } from "../components/Modal";
import { Button } from "../components/ui/Button";
import { cn } from "../libs/utils";
import { Card, CardContent } from "../components/ui/Card";
import { ArrowNavigator } from "../components/ArrowNavigator";
import { PaneContext, PanesContext } from "../components/pane/Contexts";
import { VFS } from "../vfs/vfs";

function validateFolderName(name: string): boolean {
    name = name.trim();
    if (name.length === 0 || name.length > 255) return false;
    const invalidChars = /[<>:"\/\\|?*\x00-\x1F]/g;
    return !invalidChars.test(name);
}


// Update the component to accept a resolve/reject callback pattern
interface ModalMkDirProps {
    defaultValue?: string;
    context?: any; // You can replace 'any' with the actual type of your panes context
    onResolve: (folderName: string | null) => void;
}

export function ModalMkDir({ defaultValue = "", context, onResolve }: ModalMkDirProps) {
    const { panes, activeSide, updatePane } = context;
    const activePane = panes[activeSide];

    const [folderName, setFolderName] = useState(defaultValue);
    const isValid = validateFolderName(folderName);

    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setFolderName(defaultValue);
    }, [defaultValue]);

    async function handleCreateFolder(e: React.MouseEvent | React.KeyboardEvent) {
        setBusy(true);

        console.log("ENTER IN MODAL:", folderName);
        e.preventDefault();
        if (!isValid) return;
        try {
            await VFS.mkdir(activePane.location, folderName);
            const files = await VFS.ls(activePane.location);
            updatePane(activeSide, { cursor: folderName, files });
            onResolve(folderName.trim());
        } catch (err) {
            console.error("Error creating folder:", err);
            setError((err as Error).message || "Unknown error");
        }
        setBusy(false);

    }

    const handleCancel = () => {
        if (busy) return;
        onResolve(null);
    };

    return (
        <Modal open={true} onClose={handleCancel}>

            <Card variant={error ? "error" : "ready"} className='m-2 max-h-[80svh] ring-black/5 ring-4 gap-0'>

                {error && <CardContent className='flex-col overflow-auto xgap-4 p-8 py-4 '>
                    <div className='flex justify-between gap-2 text-red-600 '>
                        {error}
                    </div>
                    <ArrowNavigator variant="horizontal">
                        <div className='flex justify-center w-full gap-2 pt-2'>
                            <Button disabled={busy} autoFocus outline onClick={handleCancel}>Close</Button>
                        </div>
                    </ArrowNavigator>
                </CardContent>}

                {!error && <CardContent className='flex-col overflow-auto xgap-4 p-8 py-4 '>
                    <div className='flex justify-between gap-2 '>
                        New folder name
                    </div>

                    <input
                        disabled={busy}
                        spellCheck={false}
                        type="text"
                        value={folderName}
                        onChange={(e) => setFolderName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder(e)}
                        className={cn('ring-4 ring-gray-300 rounded-none outline-none -mx-1 p-1',
                            'bg-white  focus:ring-blue-300')}
                        placeholder="Folder name" />

                    <ArrowNavigator variant="horizontal">
                        <div className='flex justify-center w-full gap-2 pt-2'>
                            <Button disabled={busy} outline onClick={handleCancel}>Cancel</Button>
                            <Button disabled={!isValid || busy} outline onClick={handleCreateFolder}>Create</Button>
                        </div>
                    </ArrowNavigator>
                </CardContent>}

            </Card>
        </Modal >
    )
}