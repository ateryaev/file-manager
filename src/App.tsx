import { useEffect, useState } from 'react'
import Files from './pages/Files'
import ViewAsTxt from './pages/ViewAsTxt'
import { useCommanderStore } from './hooks/useCommanderStore'
import { RAMDrive } from './vfs/RAMDrive'
import { VFS } from './vfs/vfs'
import ViewAsHex from './pages/ViewAsHex'
import ViewAsImage from './pages/ViewAsImage'


// TODO: implement routing instead of page state
// e.g. #files:RAM://docs|view:RAM://docs/readme.txt - files pane on the left, view file on the right
// e.g. #files:RAM://docs - files pane only
// e.g. #edit:RAM://docs/readme.txt - edit file full screen

type Page = 'files' | 'viewastxt' | 'viewashex' | 'viewasimage'

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
    setCurrentPage('viewashex')
  }

  function handleViewAs(as: "text" | "hex" | "image", filePath: string) {
    setViewFilePath(filePath)
    if (as === "text") {
      setCurrentPage('viewastxt')
    } else if (as === "hex") {
      setCurrentPage('viewashex')
    } else if (as === "image") {
      setCurrentPage('viewasimage')
    }
  }
  function handleBack() {
    setCurrentPage('files')
  }

  return (
    <>
      {currentPage === 'files' && <Files onExecute={handleExecute} onViewAs={handleViewAs} />}
      {currentPage === 'viewastxt' && <ViewAsTxt filePath={viewFilePath} onBack={handleBack} />}
      {currentPage === 'viewashex' && <ViewAsHex filePath={viewFilePath} onBack={handleBack} />}
      {currentPage === 'viewasimage' && <ViewAsImage filePath={viewFilePath} onBack={handleBack} />}
    </>
  )
}
