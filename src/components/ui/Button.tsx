import { cn } from "../../libs/utils";

export function Button({ className, kind = "default", children, ...props }:
    React.ComponentProps<"div"> & { kind?: 'default' | 'div' } |
    React.ComponentProps<"button"> & { kind?: 'default' | 'div' }
) {
    const Component = kind === 'default' ? 'button' : 'div';

    return (
        <Component
            className={cn('hover:bg-blue-500/10 outline-none',
                'cursor-pointer select-none',
                'disabled:pointer-events-none disabled:opacity-50',
                'focus:bg-blue-500/10 ',
                className)} {...props as any}>
            [{children}]
        </Component>
    )
}