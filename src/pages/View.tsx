import { useEffect, useState } from 'react'
import { AnyFooter, Footer } from '../components/Footer'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { cn } from '../libs/utils'
import { VFS } from '../vfs/vfs'
import { FocusTrap } from 'focus-trap-react'
import { useKeyboard } from '../hooks/useKeyboard'

interface ViewProps {
    filePath: string
    onBack: () => void
}

export default function View({ filePath, onBack }: ViewProps) {

    const [content, setContent] = useState<string>('Loading...');
    const [status, setStatus] = useState<'loading' | 'error' | 'ready'>('loading');

    useEffect(() => {
        async function loadContent() {
            setStatus('loading');
            try {
                const blob = await VFS.read(filePath + "")
                const text = await blob.text()
                setContent(text)
                setStatus('ready');
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
            <AnyFooter actions={{ "F1": "Help", "F7": "Search", "F10": "Quit" }} onAction={(action) => {
                if (action === "Back") {
                    onBack();
                }
            }} />
        </div >
    )

}
