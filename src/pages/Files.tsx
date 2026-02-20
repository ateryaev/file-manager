import { Pane } from '../components/pane/Pane'
import { Footer } from '../components/Footer'
import { PaneContextProvider, PanesContext } from '../components/pane/Contexts'
import { useContext } from 'react';


export default function Files() {
    console.log("Rendering FILES page");
    const { size, setSize } = useContext(PanesContext);
    console.log("Current pane size:", size);

    return (
        <div className='flex flex-col max-h-svh min-h-svh p-2 gap-2 bg-gray-100 shrink-0 zzpointer-events-none '>

            <div className='flex-1 flex flex-row gap-2 shrink-0xx overflow-hidden'>

                <PaneContextProvider side="left">
                    {size > 0 && <Pane style={{ flex: size }} />}
                </PaneContextProvider>
                <PaneContextProvider side="right">
                    {size < 100 && <Pane style={{ flex: 100 - size }} />}
                </PaneContextProvider>

            </div>

            <Footer onAction={() => { }} />
        </div>
    )
}
