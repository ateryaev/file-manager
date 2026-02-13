import { Modal } from "../components/Modal";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { useEffect } from "react";

interface ModalBusyProps {
    message: string;
    func: () => Promise<void>;
    onResolve: () => void;
}

export function ModalBusy(props: ModalBusyProps) {
    const { message, onResolve } = props;
    useEffect(() => {
        props.func().then(() => {
            onResolve();
        }).catch(() => {
            onResolve();
        });
    }, [props.func, onResolve]);

    const handleCancel = () => { };

    return (
        <Modal open={true} onClose={handleCancel}>
            <Card variant="ready" className='m-2 max-h-[80svh] ring-black/5 ring-4 gap-0'>
                <CardContent className='flex-col overflow-auto xgap-4 p-8 py-4 '>
                    <div className='flex justify-between gap-2 animate-pulse'>
                        {message}
                    </div>
                    <div className='justify-center w-full gap-2 pt-2'>
                        <Button outline onClick={handleCancel} className="opacity-0">Please wait...</Button>
                    </div>
                </CardContent>
            </Card>
        </Modal>
    )
}
