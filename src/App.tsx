import { useEffect, useState } from 'react'
import Files from './pages/Files'
import View from './pages/View'
import { useCommanderStore } from './hooks/useCommanderStore'
import { RAMDrive } from './vfs/RAMDrive'
import { VFS } from './vfs/vfs'


// TODO: implement routing instead of page state
// e.g. #files:RAM://docs|view:RAM://docs/readme.txt - files pane on the left, view file on the right
// e.g. #files:RAM://docs - files pane only
// e.g. #edit:RAM://docs/readme.txt - edit file full screen

type Page = 'files' | 'view'

export default function App() {

  const [currentPage, setCurrentPage] = useState<Page>('files')
  const [viewFilePath, setViewFilePath] = useState<string>('')

  const init = useCommanderStore(s => s.init);
  useEffect(() => {
    console.log("Initializing VFS and panes");
    VFS.registerDrive("RAM", new RAMDrive());
    init(["RAM://", "RAM://"]);
  }, [init]);

  function handleExecute(location: string) {
    setViewFilePath(location)
    setCurrentPage('view')
  }

  function handleBack() {
    setCurrentPage('files')
  }

  return (
    <>
      {currentPage === 'files' && <Files onExecute={handleExecute} />}
      {currentPage === 'view' && <View filePath={viewFilePath} onBack={handleBack} />}
    </>
  )
}
