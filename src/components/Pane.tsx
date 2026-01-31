import { useEffect, useRef, memo, useCallback, useState, use, createContext, useContext } from "react";
import { Card, CardContent, CardHeader } from "./ui/Card";
import { cn } from "../libs/utils";
import { IconHome, IconHome2, IconHomeFilled, IconServer } from "@tabler/icons-react";
import { PaneFileList } from "./pane/PaneFileList";
import { Counter } from "./RenderCounter";

import { ViewTextFile } from "./pane/ViewTextFile";
import { PaneContext } from "./pane/PaneContext";

export const Pane = memo(function FilePane({ ...props }: {
} & React.ComponentProps<"div">) {

    console.log("Rendering PANE");
    const { active, location, fileInfo, activate } = useContext(PaneContext);

    return (
        <Card onMouseDown={activate} className={cn('flex-1')} variant={active ? 'ready' : 'blur'} {...props} >
            <CardHeader label={(<IconHome size={18} />)} className="">
                {location}<Counter />
            </CardHeader>

            {fileInfo?.kind === "directory" && <PaneFileList />}
            {fileInfo?.kind === "file" && <ViewTextFile />}
            {fileInfo === null && <CardContent>Loading...</CardContent>}

        </Card>
    );
});
