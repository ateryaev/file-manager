import { useContext, useEffect, useState } from "react";
import { Modal } from "../components/Modal";
import { Button } from "../components/ui/Button";
import { cn } from "../libs/utils";
import { Card, CardContent } from "../components/ui/Card";
import { ArrowNavigator } from "../components/ArrowNavigator";
import { PaneContext, PanesContext } from "../components/pane/PaneContext";

function validateFolderName(name: string): boolean {
    name = name.trim();
    if (name.length === 0 || name.length > 255) return false;
    const invalidChars = /[<>:"\/\\|?*\x00-\x1F]/g;
    return !invalidChars.test(name);
}


// Update the component to accept a resolve/reject callback pattern
interface ModalMkDirProps {
    defaultValue?: string;
    onResolve: (folderName: string | null) => void;
}

export function ModalMkDir({ defaultValue = "", onResolve }: ModalMkDirProps) {
    const [folderName, setFolderName] = useState(defaultValue);
    const isValid = validateFolderName(folderName);

    useEffect(() => {
        setFolderName(defaultValue);
    }, [defaultValue]);

    function handleCreateFolder(e: React.MouseEvent | React.KeyboardEvent) {
        e.preventDefault();
        if (!isValid) return;
        onResolve(folderName.trim());
    }

    const handleCancel = () => {
        onResolve(null);
    };

    return (
        <Modal open={true} onClose={handleCancel}>

            <Card variant="ready" className='m-2 max-h-[80svh] ring-black/5 ring-4 gap-0'>
                <CardContent className='flex-col overflow-auto xgap-4 p-8 py-4 '>
                    <div className='flex justify-between gap-2 '>
                        New folder name
                    </div>

                    <input
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
                            <Button outline onClick={handleCancel}>Cancel</Button>
                            <Button disabled={!isValid} outline onClick={handleCreateFolder}>Create</Button>
                        </div>
                    </ArrowNavigator>
                </CardContent>
            </Card>
        </Modal >
    )
}