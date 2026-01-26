import { use, useCallback, useEffect, useState } from 'react'
import { FilePane } from '../components/FilePane'
import { ModalMkDir } from '../components/ModalMkDir'
import { Footer } from '../components/Footer'
import { useKeyboard } from '../hooks/useKeyboard'
import { DropDrive } from '../vfs/DropDrive'
import { FileEntry, VFS } from '../vfs/vfs'
import { clampLocation } from '../libs/location'
import { ViewAsDialog } from '../dialogs/ViewAsDialog'
import { usePaneStore } from '../hooks/usePaneStore'
import { modalManager } from '../libs/modalManager'

interface FilesProps {
    onExecute: (location: string) => void;
    onViewAs: (as: "text" | "hex" | "image", filePath: string) => void;
}

export default function Files({ onExecute, onViewAs }: FilesProps) {
    console.log("Rendering FILES page");

    // const setFocusedPane = useCommanderStore(s => s.setFocused);
    // const focusedPane = useCommanderStore(s => s.focusedPane);
    // const currentDialog = useCommanderStore(s => s.currentDialog);
    // const showDialog = useCommanderStore(s => s.showDialog);
    // const hideDialog = useCommanderStore(s => s.hideDialog);
    // const mkdir = useCommanderStore(s => s.mkdir);

    // const navigate = useCommanderStore(s => s.navigate);
    // const rememberState = useCommanderStore(s => s.rememberState);

    useKeyboard(true, {
        Tab: (e) => {
            usePaneStore.getState().setActivePane((usePaneStore.getState().activePane + 1) % usePaneStore.getState().getPanesCount());
            e.preventDefault();

        },
        F7: async (e) => {
            e.preventDefault();
            const currentLocation = usePaneStore.getState().getLocation(usePaneStore.getState().activePane);

            const folderName = await modalManager.show<string | null>(ModalMkDir, { defaultValue: "new folder 1" });

            if (folderName) {
                await VFS.mkdir(currentLocation, folderName);
                usePaneStore.getState().setCursorHistory(usePaneStore.getState().activePane, folderName);
            }
        },
        F3: async (e) => {
            e.preventDefault();
            const activePane = usePaneStore.getState().activePane;
            const cursor = usePaneStore.getState().getCursor(activePane);
            const location = usePaneStore.getState().getLocation(activePane);
            const items = await VFS.ls(location);
            const file = items.find(item => item.name === cursor);

            if (!file || file.kind !== "file") {
                console.warn("No file selected to view");
                return;
            }

            const viewType = await modalManager.show<"text" | "hex" | "image" | null>(ViewAsDialog, {});

            if (viewType) {
                const filePath = clampLocation(`${location}/${file.name}`);
                onViewAs?.(viewType, filePath);
            }
        },
        F10: (e) => {
            window.showDirectoryPicker({ startIn: 'desktop', mode: 'readwrite' }).then(async (handle: FileSystemDirectoryHandle) => {
                VFS.registerDrive(handle.name, new DropDrive(handle));
                usePaneStore.getState().setLocation(usePaneStore.getState().activePane, `${handle.name}://`);
                //await navigate(focusedPane, `${handle.name}://`, 0);
                // console.log("Directory handle:", handle);
                // if (handle) {
                //     for await (const entry of handle.values()) {
                //         console.log(entry, entry.name, entry.kind);
                //     }
                // }
            });
        }
    });

    // async function handleExecute(paneIndex: number, file: FileEntry, scrollTop?: number) {
    //     const name = file.name;
    //     rememberState(paneIndex, locations[paneIndex], name, scrollTop ?? 0);
    //     //TODO: how to save scrollTop for other panes?
    //     if (file.kind === "file") {
    //         onExecute?.(clampLocation(`${locations[paneIndex]}/${name}`));
    //         return;
    //     } else if (file.kind === "directory") {
    //         //const newScrollTop = 
    //         await navigate(paneIndex, clampLocation(`${locations[paneIndex]}/${name}`), scrollTop ?? 0);
    //         //scrollRef.current && (scrollRef.current.scrollTop = newScrollTop);
    //     }
    // }

    const handleExecute = useCallback(async (file: FileEntry) => {
        if (file.kind === "directory") {
            const currentLocation = usePaneStore.getState().getLocation(usePaneStore.getState().activePane);
            usePaneStore.getState().setLocation(usePaneStore.getState().activePane,
                clampLocation(`${currentLocation}/${file.name}`));
        }
        console.log("HANDLE EXECUTE:", file);
    }, []);



    return (
        <div className='flex flex-col max-h-svh min-h-svh p-2 gap-2 bg-gray-100 shrink-0'>

            <div className='flex-1 flex flex-row gap-2 shrink-0xx overflow-hidden'>
                {[0, 1].map((_, i) => (
                    <FilePane
                        key={i}
                        paneIndex={i}
                        //location={location}
                        onMouseDown={() => usePaneStore.getState().setActivePane(i)}
                    // onExecute={handleExecute}
                    />
                ))}
            </div>

            <Footer onAction={() => { }} />
        </div>
    )
}
