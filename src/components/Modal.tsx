import { useRef, useEffect, useState } from 'react';
import { Card, CardContent } from './ui/Card';
import { FocusTrap } from 'focus-trap-react';

export function Modal({ open, children, onClose }: { open: boolean, children: React.ReactNode, onClose?: () => void }) {
    const dialogRef = useRef<HTMLDialogElement>(null);

    const [active, setActive] = useState(false);
    useEffect(() => { setActive(open); }, [open]);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        if (open) {
            dialog.showModal();
            // const focusableElements = dialog.querySelectorAll<HTMLElement>('input');
            // console.log('Focusing element:', focusableElements);
            // if (focusableElements.length > 0) {
            //      focusableElements[0].focus();
            // }
        } else {
            dialog.close();
        }
    }, [open]);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        const handleCancel = (e: Event) => {
            e.preventDefault();
            onClose?.();
        };

        const handleBackdropClick = (e: MouseEvent) => {
            if (e.target === dialogRef.current) {
                onClose?.();
            }
        };

        dialog.addEventListener('cancel', handleCancel);
        document.addEventListener('mousedown', handleBackdropClick);
        return () => {
            dialog.removeEventListener('cancel', handleCancel);
            document.removeEventListener('mousedown', handleBackdropClick);
        };
    }, [onClose, open]);

    if (!open) return null;
    return (
        <dialog
            ref={dialogRef}
            className="overflow-hidden w-lg max-w-svw  max-h-svh bg-transparent backdrop:bg-black/20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        >
            <FocusTrap active={active} focusTrapOptions={{ escapeDeactivates: false }}>
                {children}
            </FocusTrap>
        </dialog>
    );
}