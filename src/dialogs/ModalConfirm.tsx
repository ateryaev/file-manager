import { Modal } from "../components/Modal";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { ArrowNavigator } from "../components/ArrowNavigator";

interface ModalConfirmProps {
    message: string;
    onResolve: (confirmed: boolean) => void;
}

export function ModalConfirm(props: ModalConfirmProps) {
    const { message, onResolve } = props;
    const handleConfirm = () => {
        onResolve(true);
    };

    const handleCancel = () => {
        onResolve(false);
    };

    return (
        <Modal open={true} onClose={handleCancel}>
            <Card variant="ready" className='m-2 max-h-[80svh] ring-black/5 ring-4 gap-0'>
                <CardContent className='flex-col overflow-auto xgap-4 p-8 py-4 '>
                    <div className='flex justify-between gap-2 '>
                        {message}
                    </div>

                    <ArrowNavigator variant="horizontal">
                        <div className='flex justify-center w-full gap-2 pt-2'>
                            <Button outline onClick={handleCancel}>Cancel</Button>
                            <Button outline onClick={handleConfirm}>OK</Button>
                        </div>
                    </ArrowNavigator>
                </CardContent>
            </Card>
        </Modal>
    )
}
