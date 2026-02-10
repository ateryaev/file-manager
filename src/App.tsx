import { useEffect, useState } from 'react'
import Files from './pages/Files'
import ViewAsTxt from './pages/ViewAsTxt'
import { RAMDrive } from './vfs/RAMDrive'
import { VFS } from './vfs/vfs'
import ViewAsHex from './pages/ViewAsHex'
import ViewAsImage from './pages/ViewAsImage'
import { PanesContextProvider } from './components/pane/Contexts'
import { ROMDrive } from './vfs/ROMDrive'


// TODO: implement routing instead of page state
// e.g. #files:RAM://docs|view:RAM://docs/readme.txt - files pane on the left, view file on the right
// e.g. #files:RAM://docs - files pane only
// e.g. #edit:RAM://docs/readme.txt - edit file full screen

type Page = 'files' | 'viewastxt' | 'viewashex' | 'viewasimage'


VFS.registerDrive("RAM", new RAMDrive(), "Temporal drive, will be reset on restart");
VFS.registerDrive("ROM", new ROMDrive(), "Readonly drive for permanent files");




export default function App() {

  const [locations, setLocations] = useState<string[]>(["RAM://", "RAM://docs"])
  const [currentPage, setCurrentPage] = useState<Page>('files')
  const [viewFilePath, setViewFilePath] = useState<string>('')


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
    <PanesContextProvider>
      {currentPage === 'files' && <Files onExecute={handleExecute} onViewAs={handleViewAs} />}
      {currentPage === 'viewastxt' && <ViewAsTxt filePath={viewFilePath} onBack={handleBack} />}
      {currentPage === 'viewashex' && <ViewAsHex filePath={viewFilePath} onBack={handleBack} />}
      {currentPage === 'viewasimage' && <ViewAsImage filePath={viewFilePath} onBack={handleBack} />}
    </PanesContextProvider>
  )
}
