import { Modal } from "../components/Modal";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { ArrowNavigator } from "../components/ArrowNavigator";
import { cn } from "../libs/utils";
import { useState, useRef, useEffect } from "react";

interface ModalPromptProps {
    title: string;
    defaultValue?: string;
    validate?: (value: string) => boolean;
    action?: string;
    onResolve: (value: string | null) => void;
}

export function ModalPrompt(props: ModalPromptProps) {
    const { title, defaultValue = "", validate = (v) => v.trim().length > 0, action = "OK", onResolve } = props;
    const [value, setValue] = useState(defaultValue);
    const isValid = validate(value);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
    }, []);

    const handleConfirm = () => {
        onResolve(value);
    };

    const handleCancel = () => {
        onResolve(null);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            if (isValid) {
                handleConfirm();
            }
        } else if (e.key === "Escape") {
            e.preventDefault();
            handleCancel();
        }
    };

    return (
        <Modal open={true} onClose={handleCancel}>
            <Card variant="ready" className='m-2 max-h-[80svh] ring-black/5 ring-4 gap-0'>
                <CardContent className='flex-col overflow-auto xgap-4 p-8 py-4 '>
                    <div className='flex justify-between gap-2'>
                        {title}
                    </div>

                    <input
                        ref={inputRef}
                        spellCheck={false}
                        type="text"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className={cn('ring-4 ring-gray-300 rounded-none outline-none -mx-1 p-1',
                            'bg-white focus:ring-blue-300')}
                    />

                    <ArrowNavigator variant="horizontal">
                        <div className='flex justify-center w-full gap-2 pt-2'>
                            <Button outline onClick={handleCancel}>Cancel</Button>
                            <Button disabled={!isValid} outline onClick={handleConfirm}>{action}</Button>
                        </div>
                    </ArrowNavigator>
                </CardContent>
            </Card>
        </Modal>
    )
}
