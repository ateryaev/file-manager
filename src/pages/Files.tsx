import { useEffect } from 'react'
import { FilePane } from '../components/FilePane'
import { ModalMkDir } from '../components/ModalMkDir'
import { useCommanderStore } from '../hooks/useCommanderStore'
import { Footer } from '../components/Footer'
import { useKeyboard } from '../hooks/useKeyboard'

interface FilesProps {
    onExecute: (location: string) => void
}

export default function Files({ onExecute }: FilesProps) {

    const panes = useCommanderStore(s => s.panes);
    const setFocusedPane = useCommanderStore(s => s.setFocused);
    const focusedPane = useCommanderStore(s => s.focusedPane);
    const currentDialog = useCommanderStore(s => s.currentDialog);
    const showDialog = useCommanderStore(s => s.showDialog);
    const hideDialog = useCommanderStore(s => s.hideDialog);
    const mkdir = useCommanderStore(s => s.mkdir);


    useKeyboard(!currentDialog, {
        Tab: (e) => {
            //e.shiftKey ? setFocusedPane(focusedPane - 1)
            setFocusedPane(focusedPane + 1);
        },
        F7: (e) => {
            showDialog('mkdir');
        }
    });

    function handleExecute(location: string) {
        onExecute(location);
    }

    async function handleCreateFolder(folderName: string) {
        await mkdir(folderName);
        hideDialog();
    }

    return (
        <div className='flex flex-col max-h-svh min-h-svh p-2 gap-2 bg-gray-100 shrink-0'>

            <div className='flex-1 flex flex-row gap-2 shrink-0xx overflow-hidden'>
                {panes.map((p, i) => (
                    <FilePane
                        key={i}
                        paneIndex={i}
                        startLocation={p.location}
                        onMouseDown={() => setFocusedPane(i)}
                        onExecute={handleExecute}
                    />
                ))}
            </div>

            <Footer onAction={showDialog} />

            {currentDialog === 'mkdir' && (
                <ModalMkDir onCreate={handleCreateFolder} onCancel={hideDialog} />
            )}
        </div >
    )
}
