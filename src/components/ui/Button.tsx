import { cn } from "../../libs/utils";

export function Button({ className, kind = "default", outline = false, icon = null, children, ...props }:
    //React.ComponentProps<"div"> & { kind?: 'default' | 'div'; outline?: boolean; icon?: React.ReactNode } |
    React.ComponentProps<"button"> & { kind?: 'default' | 'div'; outline?: boolean; icon?: React.ReactNode }
) {
    const Component = kind === 'default' ? 'button' : 'div';

    return (
        <Component
            className={cn('hover:bg-blue-500/10 outline-none',
                'cursor-pointer select-none',
                'disabled:pointer-events-none disabled:text-gray-300',
                'focus:bg-blue-500/10 px-2 py-1 flex gap-2',
                'overflow-hidden',
                className)} {...props as any}>
            {outline && <span>[</span>}
            {icon && <span className={cn(!props.disabled && "text-blue-500")}>{icon}</span>}
            {children && <span className="flex-1 xbg-white text-left shrink-0 truncate">{children}</span>}
            {outline && <span>]</span>}
        </Component>
    )
}