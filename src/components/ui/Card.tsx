import { createContext, useContext } from "react";
import { cn } from "../../libs/utils";

const CardContext = createContext<{ variant?: string }>({});

export function Card({ variant, className, children, ...props }: React.ComponentProps<"div"> & { variant?: string }) {

    return (
        <CardContext.Provider value={{ variant }}>
            <div className={cn('bg-gray-200 p-2 flex flex-col gap-2 overflow-hidden w-fullx',
                variant === 'blur' && 'bg-gray-200',
                variant === 'ready' && 'bg-blue-300',
                variant === 'loading' && 'bg-blue-300',
                variant === 'error' && 'bg-red-300',
                className)} {...props}>
                {children}
            </div>
        </CardContext.Provider>
    )
}

export function CardContent({ className, children, ...props }: React.ComponentProps<"div">) {
    return (
        <div className={cn('bg-gray-50 flex gap-2 pr-1 border-4 border-transparent flex-1 overflow-y-scroll  overflow-x-auto',
            '[&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar]:size-2 [&::-webkit-scrollbar]:bg-gray-100',
            className)} {...props}>
            {children}
        </div>
    )
}

export function CardHeader({ className, label, children, ...props }: React.ComponentProps<"div"> & { label?: string }) {
    const { variant } = useContext(CardContext);
    return (
        <div className={cn('bg-gray-50/80 p-1 flex gap-2', className)} {...props}>
            {label && <span className={cn('bg-blue-300 text-white px-2 py-1  select-none ',
                variant === 'blur' && 'bg-gray-200',
                variant === 'ready' && 'bg-blue-300',
                variant === 'loading' && 'bg-blue-300 animate-pulse',
                variant === 'error' && 'bg-red-300'
            )}>{label}</span>}
            <span className="flex-1 truncate flex justify-between  px-2 py-1">{children}</span>
        </div>
    )
}