import { use, useCallback, useContext, useEffect, useState } from 'react'
import { Pane } from '../components/pane/Pane'
import { Footer } from '../components/Footer'
import { useKeyboard } from '../components/pane/Hooks'
import { FileEntry, VFS } from '../vfs/vfs'
import { clampLocation } from '../libs/location'
import { PaneContextProvider, PanesContext } from '../components/pane/Contexts'


export default function Files() {
    console.log("Rendering FILES page");

    const { activeSide, setActiveSide } = useContext(PanesContext);

    useKeyboard({
        Tab: (e) => {
            e.preventDefault();
            setActiveSide((activeSide === "left" ? "right" : "left"));
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
    });


    return (
        <div className='flex flex-col max-h-svh min-h-svh p-2 gap-2 bg-gray-100 shrink-0 zzpointer-events-none'>

            <div className='flex-1 flex flex-row gap-2 shrink-0xx overflow-hidden'>

                <PaneContextProvider side="left">
                    <Pane />
                </PaneContextProvider>
                <PaneContextProvider side="right">
                    <Pane />
                </PaneContextProvider>

            </div>

            <Footer onAction={() => { }} />
        </div>
    )
}
