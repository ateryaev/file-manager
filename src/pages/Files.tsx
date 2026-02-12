import { Pane } from '../components/pane/Pane'
import { Footer } from '../components/Footer'
import { PaneContextProvider } from '../components/pane/Contexts'


export default function Files() {
    console.log("Rendering FILES page");

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
