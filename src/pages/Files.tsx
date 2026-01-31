import { use, useCallback, useContext, useEffect, useState } from 'react'
import { Pane } from '../components/Pane'
import { ModalMkDir } from '../dialogs/ModalMkDir'
import { Footer } from '../components/Footer'
import { useKeyboard } from '../hooks/useKeyboard'
import { DropDrive } from '../vfs/DropDrive'
import { FileEntry, VFS } from '../vfs/vfs'
import { clampLocation } from '../libs/location'
import { ViewAsDialog } from '../dialogs/ViewAsDialog'
import { usePaneStore } from '../hooks/usePaneStore'
import { modalManager } from '../libs/modalManager'
import { modalState } from '../components/Modal'
import { PaneContextProvider, PanesContext, PanesContextProvider } from '../components/pane/PaneContext'

interface FilesProps {
    onExecute: (location: string) => void;
    onViewAs: (as: "text" | "hex" | "image", filePath: string) => void;
}

export default function Files({ onExecute, onViewAs }: FilesProps) {
    console.log("Rendering FILES page");

    const { activePane, setActivePane } = useContext(PanesContext);

    // const setFocusedPane = useCommanderStore(s => s.setFocused);
    // const focusedPane = useCommanderStore(s => s.focusedPane);
    // const currentDialog = useCommanderStore(s => s.currentDialog);
    // const showDialog = useCommanderStore(s => s.showDialog);
    // const hideDialog = useCommanderStore(s => s.hideDialog);
    // const mkdir = useCommanderStore(s => s.mkdir);

    // const navigate = useCommanderStore(s => s.navigate);
    // const rememberState = useCommanderStore(s => s.rememberState);

    useKeyboard({
        Tab: (e) => {
            e.preventDefault();
            setActivePane((activePane + 1) % 2);
        },

        // F3: async (e) => {
        //     e.preventDefault();
        //     const activePane = usePaneStore.getState().activePane;
        //     const cursor = usePaneStore.getState().getCursor(activePane);
        //     const location = usePaneStore.getState().getLocation(activePane);
        //     const items = await VFS.ls(location);
        //     const file = items.find(item => item.name === cursor);

        //     if (!file || file.kind !== "file") {
        //         console.warn("No file selected to view");
        //         return;
        //     }

        //     const viewType = await modalManager.show<"text" | "hex" | "image" | null>(ViewAsDialog, {});

        //     if (viewType) {
        //         const filePath = clampLocation(`${location}/${file.name}`);
        //         onViewAs?.(viewType, filePath);
        //     }
        // },
        // F10: (e) => {
        //     window.showDirectoryPicker({ startIn: 'desktop', mode: 'readwrite' }).then(async (handle: FileSystemDirectoryHandle) => {
        //         VFS.registerDrive(handle.name, new DropDrive(handle));

        //         //usePaneStore.getState().setLocation(usePaneStore.getState().activePane, `${handle.name}://`);
        //         //await navigate(focusedPane, `${handle.name}://`, 0);
        //         // console.log("Directory handle:", handle);
        //         // if (handle) {
        //         //     for await (const entry of handle.values()) {
        //         //         console.log(entry, entry.name, entry.kind);
        //         //     }
        //         // }
        //     });
        // }
    }, true);


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

                <PaneContextProvider>
                    <Pane />
                </PaneContextProvider>
                <PaneContextProvider>
                    <Pane />
                </PaneContextProvider>

            </div>

            <Footer onAction={() => { }} />
        </div>
    )
}
