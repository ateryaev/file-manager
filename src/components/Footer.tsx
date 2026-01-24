import { Button } from "./ui/Button";
import { Card, CardContent } from "./ui/Card";

function FButton({ fkey, ...props }: {
    fkey: string;
} & React.ComponentProps<"button">) {

    return (
        <Button icon={fkey} className="flex-1 bg-gray-100" {...props}>
            {/* <span className={props.disabled ? 'text-gray-300' : 'text-blue-600'}>{fkey}</span> */}
            {props.children}
        </Button>
    );
}

// Generic footer component that can be used in different contexts
// <AnyFooter actions={"F1": "Help", "F7":"Search", "F10": "Quit"} onAction={(action)=>{...}} />
// keys can be F1-F10
// if no F2 - render disabled empty button
export function AnyFooter({ actions, onAction }: { actions: Record<string, string>, onAction?: (action: string) => void }) {
    return (
        <Card className=' shrink-0'>
            <CardContent className="justify-between overflow-x-auto -xxhidden shrink-0">

                {Array.from({ length: 10 }, (_, i) => {
                    const fkey = `F${i + 1}`;
                    const label = actions[fkey];
                    return (
                        <FButton
                            key={fkey}
                            fkey={fkey}
                            disabled={!label}
                            onClick={() => label && onAction?.(label)}
                        >
                            {label || '\u00A0'}
                        </FButton>
                    );
                }
                )}

            </CardContent>
        </Card>
    )
}

export function Footer({ onAction }: { onAction?: (action: "mkdir" | "view" | "delete") => void }) {
    return (
        <Card className=' shrink-0'>
            <CardContent className="justify-between">
                <FButton fkey="F1" >Help</FButton>
                <FButton fkey="F2" disabled>Settings</FButton>
                <FButton fkey="F3" onClick={() => onAction?.('view')}>View...</FButton>
                <FButton fkey="F4" disabled>Edit</FButton>
                <FButton fkey="F5" disabled>Copy</FButton>
                <FButton fkey="F6" disabled>RenMove</FButton>
                <FButton fkey="F7" onClick={() => onAction?.('mkdir')}>Mkdir</FButton>
                <FButton fkey="F8" disabled>Delete</FButton>
                <FButton fkey="F9" disabled>Menu</FButton>
                <FButton fkey="F10" disabled>Drives</FButton>
            </CardContent>
        </Card>
    )
}