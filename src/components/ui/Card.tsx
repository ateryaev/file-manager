import { createContext, useContext } from "react";
import { cn } from "../../libs/utils";

const CardContext = createContext<{ variant?: string }>({});

export function Card({ variant, className, children, ...props }: React.ComponentProps<"div"> & { variant?: string }) {

    return (
        <CardContext.Provider value={{ variant }}>
            <div className={cn('bg-gray-200 p-2 flex flex-col gap-2 overflow-hidden transition-colors',
                "variant-" + variant,
                variant === 'blur' && 'bg-blue-200 saturate-0 opacity-70 group blurcard',
                variant === 'ready' && 'in-[.window-active]:bg-blue-300 group readycard',
                variant === 'loading' && 'bg-blue-300 group loadingcard',
                variant === 'error' && 'bg-red-300 group errorcard',
                className)} {...props}>
                {children}
            </div>
        </CardContext.Provider>
    )
}

export function CardContent({ ref, className, children, ...props }: React.ComponentProps<"div">) {
    return (
        <div ref={ref} className={cn('bg-gray-50 flex gap-2 pr-1 border-4 border-transparent flex-1 overflow-y-scroll  overflow-x-auto',
            '[&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar]:size-2 [&::-webkit-scrollbar]:bg-gray-100',
            className)} {...props} >
            {children}
        </div>
    )
}

export function CardHeader({ className, label, children, ...props }: React.ComponentProps<"div"> & { label?: any }) {
    const { variant } = useContext(CardContext);
    return (
        <div className={cn('bg-gray-50/80 p-0 flex gap-4', className)} {...props}>
            {/* {label && <span className={cn('bg-blue-300 text-white white px-3 py-1 grid items-center  select-none ',
                variant === 'blur' && 'bg-gray-200',
                variant === 'ready' && 'bg-blue-300',
                variant === 'loading' && 'bg-blue-300 animate-pulse',
                variant === 'error' && 'bg-red-300'
            )}>{label}</span>}
            <span className="flex-1 truncate flex justify-between  px-0 py-1">test{children}</span> */}
            <div className="flex gap-4  items-center px-4 py-2 w-full">
                {label}{children}&nbsp;
            </div>
        </div>
    )
}