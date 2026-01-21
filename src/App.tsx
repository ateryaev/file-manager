import { useEffect, useState } from 'react'
import { cn } from './libs/utils'
import { Card, CardContent } from './components/ui/Card'
import { Button } from './components/ui/Button'
import { Modal } from './components/Modal'
import { FilePane } from './components/FilePane'
import { useCommanderStore } from './hooks/useCommanderStore'
import { VFS } from './vfs/vfs'
import { RAMDrive } from './vfs/RAMDrive'

export default function App() {
  const [showDialog, setShowDialog] = useState(false);

  const panes = useCommanderStore(s => s.panes);
  const setFocusedPane = useCommanderStore(s => s.setFocused);
  const focusedPane = useCommanderStore(s => s.focusedPane);
  const init = useCommanderStore(s => s.init);
  const modalActionOngoing = useCommanderStore(s => s.modalActionOngoing);
  const setModalActionOngoing = useCommanderStore(s => s.setModalActionOngoing);
  const mkdir = useCommanderStore(s => s.mkdir);

  useEffect(() => {
    VFS.registerDrive("RAM", new RAMDrive());
    init(["RAM://", "RAM://docs", "RAM://src/blabla"]);
  }, [init]);

  useEffect(() => {
    setModalActionOngoing(showDialog);
  }, [showDialog]);

  // console.log('Pane info:', paneInfo, focusedPane);

  useEffect(() => {
    if (modalActionOngoing) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        setFocusedPane(focusedPane + 1);
        //setActivePane(prev => (prev + 1) % 2);
        e.preventDefault();
      }
      if (e.key === "F7") {
        setShowDialog(true);
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showDialog, focusedPane, setFocusedPane, modalActionOngoing]);

  function handleExecute(location: string) {
    console.log("Executed file at location:", location, "in pane", focusedPane);
  }

  async function handleCreateFolder() {
    console.log("Creating");
    setShowDialog(false);
    await mkdir("New Folder");
  }

  return (
    <>
      <div className='flex flex-col max-h-svh min-h-svh p-2 gap-2 bg-gray-100 shrink-0'>
        <Card className='shrink-0'>
          <CardContent>test</CardContent>
        </Card>

        <div className='flex-1 flex flex-row gap-2 shrink-0xx overflow-hidden'>
          {panes.map((p, i) => (
            <FilePane
              key={i}
              paneIndex={i}
              startLocation={p.location}
              onMouseDown={() => setFocusedPane(i)}
              onExecute={handleExecute}
            //active={focusedPane === i && showDialog === false}
            />
          ))}
        </div>

        <Card className=' shrink-0'>
          <CardContent>
            <Button><span className='text-blue-600 txext-white '>F1</span>&nbsp;Help</Button>
            <Button disabled><span className='text-blue-600 txext-white '>F2</span>&nbsp;Settings</Button>
            <Button onClick={() => { console.log('Create Folder clicked'); setShowDialog(true); }}>
              <span className='text-blue-600 txext-white '>F3</span>&nbsp;View</Button>
            <Button disabled><span className='text-blue-600 txext-white '>F4</span>&nbsp;Edit</Button>
            <Button onClick={() => { console.log('Create Folder clicked'); setShowDialog(true); }}>
              <span className='text-blue-600 txext-white '>F5</span>&nbsp;Copy</Button>
            <Button onClick={() => { console.log('Create Folder clicked'); setShowDialog(true); }}>
              <span className='text-blue-600 txext-white '>F6</span>&nbsp;Move/Rename</Button>
            <Button onClick={() => { console.log('Create Folder clicked'); setShowDialog(true); }}>
              <span className='text-blue-600 txext-white '>F7</span>&nbsp;Make Folder</Button>

            <Button disabled><span className='text-blue-600 txext-white '>F8</span>&nbsp;Delete</Button>
          </CardContent>
        </Card>
      </div >

      <Modal open={showDialog} onClose={() => setShowDialog(false)}>
        <Card className='m-2 overflow-hidden max-h-[80svh] bg-blue-300 ring-black/5 ring-4'>
          <CardContent className='p-4 px-8 overflow-auto flex-col bg-gray-100'>
            <div className='flex justify-between gap-2 '>
              Create the folder
              <Button kind="div" onClick={() => setShowDialog(false)} tabIndex={-1}>X</Button>
            </div>
            <input
              autoFocus={true}
              spellCheck={false}
              type="text"
              className={cn('border-4 border-gray-300 rounded-none outline-none -mx-1 p-1',
                'bg-white  focus:border-blue-300')}
              placeholder="Folder name" />
            <div className='flex justify-center gap-2'>
              <Button onClick={() => setShowDialog(false)}>Cancel</Button>
              <Button onClick={handleCreateFolder}>Create</Button>
            </div>
          </CardContent>
        </Card>
      </Modal >
    </>
  )
}
