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
import { PaneError } from "./PaneError";
import { PaneLoading } from "./PaneLoading";

export const Pane = memo(function FilePane({ ...props }: {
} & React.ComponentProps<"div">) {

    const { isActive, location, activate, files, blob, error, navigate, selection } = useContext(PaneContext);
    //console.log("Rendering PANE", location, files);
    const loading = !files && !blob && !error;

    const handleNavigate = useCallback((file: FileEntry) => {
        navigate(clampLocation(`${location}/${file.name}`), file.kind === "file" ? "view" : "files");
    }, [navigate, location]);


    return (
        <Card onMouseDown={activate} className={cn('flex-1')} variant={isActive ? 'ready' : 'blur'} {...props} >
            <CardHeader className={cn("text-blue-600")}>
                <div className={cn("truncate", location ? "" : "text-center w-full text-blue-600")}>
                    {location || "Drives Pane"}
                </div>
                <Counter />
            </CardHeader>

            {!loading && files && <PaneFiles files={files} onExecute={handleNavigate} />}
            {!loading && blob && <PaneViewText blob={blob} onExit={() => navigate(clampLocation(`${location}/..`))} />}

            {/* {parent?.kind === "directory" && <PaneFileList files={files} onExecute={navigate} />}
            {parent?.kind === "file" && <ViewTextFile />}

            {parent?.kind === "drive" && <PaneFileList />}
            {parent?.kind === "root" && <PaneFileList />}*/}

            {loading && <PaneLoading />}
            {!loading && error && <PaneError error={error} onExit={() => navigate(clampLocation(`${location}/..`))} />}
            {/* {selection && <CardHeader className="shrink-0">
                {selection.name}
            </CardHeader>} */}
        </Card>
    );
});
