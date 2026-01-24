import { useEffect, useState } from "react";
import { Modal } from "./Modal";
import { Button } from "./ui/Button";
import { cn } from "../libs/utils";
import { Card, CardContent } from "./ui/Card";
import { ArrowNavigator } from "./ArrowNavigator";

function validateFolderName(name: string): boolean {
    name = name.trim();
    if (name.length === 0 || name.length > 255) return false;
    const invalidChars = /[<>:"\/\\|?*\x00-\x1F]/g;
    return !invalidChars.test(name);
}

export function ModalMkDir({ onCreate, onCancel }: {
    onCreate: (folderName: string) => void;
    onCancel: () => void;
}) {
    const [folderName, setFolderName] = useState("");
    const isValid = validateFolderName(folderName);


    function handleCreateFolder(e: React.MouseEvent | React.KeyboardEvent) {
        e.preventDefault();
        if (!isValid) return;
        onCreate(folderName.trim());
    }

    return (
        <Modal open={true} onClose={onCancel}>

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
                            <Button outline onClick={onCancel}>Cancel</Button>
                            <Button disabled={!isValid} outline onClick={handleCreateFolder}>Create</Button>
                        </div>
                    </ArrowNavigator>
                </CardContent>
            </Card>
        </Modal >
    )
}