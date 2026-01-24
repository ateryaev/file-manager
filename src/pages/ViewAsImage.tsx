import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { VFS } from '../vfs/vfs'
import { FocusTrap } from 'focus-trap-react'
import { useKeyboard } from '../hooks/useKeyboard'

interface ViewProps {
    filePath: string
    onBack: () => void
}

export default function ViewAsImage({ filePath, onBack }: ViewProps) {

    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [status, setStatus] = useState<'loading' | 'error' | 'ready'>('loading');
    const [errorMessage, setErrorMessage] = useState<string>('');

    useEffect(() => {
        async function loadContent() {
            setStatus('loading');
            try {
                const blob = await VFS.read(filePath + "");
                const url = URL.createObjectURL(blob);
                setImageUrl(url);
                setStatus('ready');
            } catch (error) {
                setErrorMessage(`Error loading file: ${error}`)
                setStatus('error');
            }
        }
        loadContent()

        // Cleanup: revoke the blob URL when component unmounts
        return () => {
            if (imageUrl) {
                URL.revokeObjectURL(imageUrl);
            }
        }
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
                        <CardHeader label='image view'>{filePath}</CardHeader>
                        <CardContent className='p-2 outline-none flex items-center justify-center' tabIndex={0}>
                            {status === 'loading' && <div>Loading...</div>}
                            {status === 'error' && <div className='text-red-600'>{errorMessage}</div>}
                            {status === 'ready' && imageUrl && (
                                <img
                                    src={imageUrl}
                                    alt={filePath}
                                    className='max-w-full max-h-full object-contain'
                                />
                            )}
                        </CardContent>
                    </Card >
                </FocusTrap>
            </div>
        </div >
    )
}
