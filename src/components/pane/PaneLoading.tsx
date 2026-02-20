import { CardContent, CardHeader } from "../ui/Card";

export function PaneLoading() {
    return (
        <>
            <CardContent className='px-3 py-1 bg-gray-100 break-all grid place-items-center text-center text-gray-500'>
                <span className="text-gray-500 ">Loading</span>
            </CardContent>

            <CardHeader className="bg-gray-50 block text-center">
                <span className="text-gray-500 animate-pulse">...</span>
            </CardHeader>
        </>
    )
}
