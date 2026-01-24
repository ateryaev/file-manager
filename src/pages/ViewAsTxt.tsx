import { useEffect, useState } from 'react'
import { AnyFooter, Footer } from '../components/Footer'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { blobToHexView, blobToTextIfPossible, cn, hasNonTextCharsInStart } from '../libs/utils'
import { VFS } from '../vfs/vfs'
import { FocusTrap } from 'focus-trap-react'
import { useKeyboard } from '../hooks/useKeyboard'

interface ViewProps {
    filePath: string
    onBack: () => void
}

export default function ViewAsTxt({ filePath, onBack }: ViewProps) {

    const [content, setContent] = useState<string>('Loading...');
    const [status, setStatus] = useState<'loading' | 'error' | 'ready'>('loading');

    useEffect(() => {
        async function loadContent() {
            setStatus('loading');
            try {
                console.log("Loading file content from VFS 1", performance.now());
                const blob = await VFS.read(filePath + "");
                const hasNonTextChars = await hasNonTextCharsInStart(blob);
                if (hasNonTextChars) {
                    const hexView = await blobToHexView(blob);
                    setContent(hexView);
                    setStatus('ready');
                    return;
                }
                const text = await blobToTextIfPossible(blob);
                if (text === null) {
                    const hexView = await blobToHexView(blob);
                    setContent(hexView);
                    setStatus('ready');
                    return;
                }
                setContent(text);
                setStatus('ready');
                console.log("Loaded file content from VFS 2", performance.now());
            } catch (error) {
                setContent(`Error loading file: ${error}`)
                setStatus('error');
            }
        }
        loadContent()
    }, [filePath])

    useKeyboard(true, {
        Escape: (e) => onBack(),
        F10: (e) => onBack()
    });

    return (

        <div className='flex flex-col max-h-svh min-h-svh p-2 gap-2 bg-gray-100 shrink-0'>

            <div className='flex-1 gap-2 overflow-hidden grid'>
                <FocusTrap active={true}>
                    <Card variant={status}>
                        <CardHeader label='view'>{filePath}</CardHeader>
                        <CardContent className='p-2 whitespace-pre outline-none ' tabIndex={0}>
                            {content}
                        </CardContent>
                    </Card >
                </FocusTrap>
            </div>
            <AnyFooter actions={{ "F1": "Help", "F3": "View as", "F4": "Text", "F7": "Search", "F10": "Quit" }} onAction={(action) => {
                if (action === "Quit") {
                    onBack();
                }
            }} />
        </div >
    )

}
