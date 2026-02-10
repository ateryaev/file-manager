import { useEffect, useRef, memo, useCallback, useState, use, createContext, useContext } from "react";
import { Card, CardContent, CardHeader } from "../ui/Card";
import { cn } from "../../libs/utils";
import { IconDeviceFloppy, IconDisc, IconHome, IconHome2, IconHomeFilled, IconServer } from "@tabler/icons-react";
import { PaneFiles } from "./PaneFiles";
import { Counter } from "../RenderCounter";

import { PaneViewText } from "./PaneViewText";
import { PaneContext } from "./Contexts";
import { clampLocation } from "../../libs/location";
import { FileEntry } from "../../vfs/vfs";

export const Pane = memo(function FilePane({ ...props }: {
} & React.ComponentProps<"div">) {

    const { isActive, location, parent, activate, files, blob, navigate, update, selection } = useContext(PaneContext);
    //console.log("Rendering PANE", location, files);
    const loading = !files && !blob;

    const handleNavigate = useCallback((file: FileEntry) => {
        navigate(clampLocation(`${location}/${file.name}`), file.kind === "file" ? "view" : "files");
    }, [navigate, location]);

    const handleSelect = useCallback((file?: FileEntry) => {
        console.log("SELECT:", location, file?.name);
        update({ selection: file });
    }, [update, location]);

    return (
        <Card onMouseDown={activate} className={cn('flex-1')} variant={isActive ? 'ready' : 'blur'} {...props} >
            <CardHeader className={cn("text-blue-600")}>
                <div className={cn(location ? "" : "text-center w-full text-blue-600")}>
                    {location || "Drives Pane"}
                </div>
                <Counter />
            </CardHeader>

            {!loading && files && <PaneFiles files={files} onExecute={handleNavigate} onSelect={handleSelect} />}
            {!loading && blob && <PaneViewText blob={blob} onExit={() => navigate(clampLocation(`${location}/..`))} />}

            {/* {parent?.kind === "directory" && <PaneFileList files={files} onExecute={navigate} />}
            {parent?.kind === "file" && <ViewTextFile />}

            {parent?.kind === "drive" && <PaneFileList />}
            {parent?.kind === "root" && <PaneFileList />}*/}

            {loading && <CardContent className="px-3 py-1 text-gray-500">Loading...</CardContent>}
            {selection && <CardHeader>
                {selection.name}
            </CardHeader>}
        </Card>
    );
});
