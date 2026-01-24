import React, { useEffect, useState, useRef } from "react";
import { Modal } from "../components/Modal";
import { Button } from "../components/ui/Button";
import { cn } from "../libs/utils";
import { Card, CardContent } from "../components/ui/Card";
import { ArrowNavigator } from "../components/ArrowNavigator";

function DialogButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
    return (
        <Button
            className="bg-blue-300/0 focus:text-white focus:bg-blue-500"
            onClick={onClick}>
            {children}
        </Button>
    )
}
export function ViewAsDialog({ onViewAs, onCancel }: {
    onViewAs: (as: "text" | "hex" | "image") => void;
    onCancel: () => void;
}) {

    return (
        <Modal open={true} onClose={onCancel}>

            <Card variant="ready" className='m-2 max-h-[80svh] ring-black/5 ring-4 gap-0'>
                <CardContent className='flex-col overflow-auto gap-4 p-8 py-4 '>
                    <div className='flex justify-between gap-2'>
                        View file as
                    </div>

                    <ArrowNavigator variant="vertical">
                        <div className='flex flex-col gap-1 -mx-1 p-1
                        ring-4 ring-gray-300 bg-white focus-within:ring-blue-300'>
                            <DialogButton onClick={() => onViewAs("text")}>Text file</DialogButton>
                            <DialogButton onClick={() => onViewAs("hex")}>Binary hexadecimal view</DialogButton>
                            <DialogButton onClick={() => onViewAs("image")}>Image (coming soon)</DialogButton>
                        </div>
                    </ArrowNavigator>

                    <div className='flex justify-center w-full gap-2 pt-2'>
                        <Button outline onClick={onCancel}>Cancel</Button>
                    </div>
                </CardContent>
            </Card>
        </Modal >
    )
}