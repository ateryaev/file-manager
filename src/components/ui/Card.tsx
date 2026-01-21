import { cn } from "../../libs/utils";

export function Card({ className, children, ...props }: React.ComponentProps<"div">) {
    return (
        <div className={cn('bg-gray-200 p-2 flex flex-col gap-2 overflow-hidden', className)} {...props}>
            {children}
        </div>
    )
}

export function CardContent({ className, children, ...props }: React.ComponentProps<"div">) {
    return (
        <div className={cn('bg-gray-50 p-2 flex gap-2', className)} {...props}>
            {children}
        </div>
    )
}