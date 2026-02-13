import { Modal } from "../components/Modal";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { ArrowNavigator } from "../components/ArrowNavigator";

interface ModalAlertProps {
    message: string;
    variant?: "info" | "warning" | "error";
    onResolve: () => void;
}

export function ModalAlert(props: ModalAlertProps) {
    const { message, variant, onResolve } = props;

    const handleCancel = () => {
        onResolve();
    };

    return (
        <Modal open={true} onClose={handleCancel}>
            <Card variant={variant === "error" ? "error" : "ready"} className='m-2 max-h-[80svh] ring-black/5 ring-4 gap-0'>
                <CardContent className='flex-col overflow-auto xgap-4 p-8 py-4 '>
                    <div className='flex justify-between gap-2 '>
                        {message}
                    </div>

                    <ArrowNavigator variant="horizontal">
                        <div className='flex justify-center w-full gap-2 pt-2'>
                            <Button outline onClick={handleCancel}>Close</Button>
                        </div>
                    </ArrowNavigator>
                </CardContent>
            </Card>
        </Modal>
    )
}
