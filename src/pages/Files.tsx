import { use, useEffect } from 'react'
import { FilePane } from '../components/FilePane'
import { ModalMkDir } from '../components/ModalMkDir'
import { useCommanderStore } from '../hooks/useCommanderStore'
import { Footer } from '../components/Footer'
import { useKeyboard } from '../hooks/useKeyboard'
import { DropDrive } from '../vfs/DropDrive'
import { FileEntry, VFS } from '../vfs/vfs'
import { clampLocation } from '../libs/location'

interface FilesProps {
    onExecute: (location: string) => void
}

export default function Files({ onExecute }: FilesProps) {

    const locations = useCommanderStore(s => s.locations);
    const setFocusedPane = useCommanderStore(s => s.setFocused);
    const focusedPane = useCommanderStore(s => s.focusedPane);
    const currentDialog = useCommanderStore(s => s.currentDialog);
    const showDialog = useCommanderStore(s => s.showDialog);
    const hideDialog = useCommanderStore(s => s.hideDialog);
    const mkdir = useCommanderStore(s => s.mkdir);

    const navigate = useCommanderStore(s => s.navigate);
    const rememberState = useCommanderStore(s => s.rememberState);

    useKeyboard(!currentDialog, {
        Tab: (e) => {
            //e.shiftKey ? setFocusedPane(focusedPane - 1)
            setFocusedPane(focusedPane + 1);
        },
        F7: (e) => {
            showDialog('mkdir');
        },
        F10: (e) => {
            window.showDirectoryPicker({ startIn: 'desktop', mode: 'readwrite' }).then(async (handle: FileSystemDirectoryHandle) => {
                VFS.registerDrive(handle.name, new DropDrive(handle));
                await navigate(focusedPane, `${handle.name}://`, 0);
                console.log("Directory handle:", handle);
                if (handle) {
                    for await (const entry of handle.values()) {
                        console.log(entry, entry.name, entry.kind);
                    }
                }
            });
        }
    });

    async function handleExecute(paneIndex: number, file: FileEntry, scrollTop?: number) {
        const name = file.name;
        rememberState(paneIndex, locations[paneIndex], name, scrollTop ?? 0);
        //TODO: how to save scrollTop for other panes?
        if (file.kind === "file") {
            onExecute?.(clampLocation(`${locations[paneIndex]}/${name}`));
            return;
        } else if (file.kind === "directory") {
            //const newScrollTop = 
            await navigate(paneIndex, clampLocation(`${locations[paneIndex]}/${name}`), scrollTop ?? 0);
            //scrollRef.current && (scrollRef.current.scrollTop = newScrollTop);
        }
    }

    async function handleCreateFolder(folderName: string) {
        await mkdir(folderName);
        hideDialog();
    }

    return (
        <div className='flex flex-col max-h-svh min-h-svh p-2 gap-2 bg-gray-100 shrink-0'>

            <div className='flex-1 flex flex-row gap-2 shrink-0xx overflow-hidden'>
                {locations.map((location, i) => (
                    <FilePane
                        key={i}
                        paneIndex={i}
                        location={location}
                        onMouseDown={() => setFocusedPane(i)}
                        onExecute={(file, scrollTop) => handleExecute(i, file, scrollTop)}
                    />
                ))}
            </div>

            <Footer onAction={showDialog} />

            {currentDialog === 'mkdir' && (
                <ModalMkDir onCreate={handleCreateFolder} onCancel={hideDialog} />
            )}
        </div>
    )
}
