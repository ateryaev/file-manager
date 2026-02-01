//location is DRIVE:/PATH/TO/FILE

function getDrive(location: string): string {
    const parts = location.split(":/");
    if (parts.length < 2) throw new Error("Invalid location format");
    return parts[0];
}

function getPath(location: string): string {
    const parts = location.split(":/");
    if (parts.length < 2) return "/";
    return parts[1];
}

function goUpLocation(location: string): string {
    const drive = getDrive(location);
    const path = getPath(location);
    if (path === "/") return location;
    const pathParts = path.split("/").filter(Boolean);
    pathParts.pop();
    const newPath = "/" + pathParts.join("/");
    return `${drive}://${newPath}`;
}

function goDeepLocation(location: string, name: string): string {
    const drive = getDrive(location);
    const path = getPath(location);
    const newPath = path === "/" ? `/${name}` : `${path}/${name}`;
    return `${drive}://${newPath}`;
}

function clampLocation(location: string): string {
    const parts = location.split("/").filter(Boolean);
    const stack: string[] = [];
    for (const part of parts) {
        if (part === ".") continue;
        if (part === "..") {
            stack.pop();
        } else {
            stack.push(part);
        }
    }
    return stack.join("/");
    // Remove redundant slashes, resolve "." and ".."
    // const drive = getDrive(location);
    // let path = getPath(location);
    // const parts = path.split("/").filter(Boolean);
    // const stack: string[] = [];
    // for (const part of parts) {
    //     if (part === ".") continue;
    //     if (part === "..") {
    //         stack.pop();
    //     } else {
    //         stack.push(part);
    //     }
    // }
    // return `${drive}:/${stack.join("/")}`;
}



export {
    getDrive,
    getPath,
    clampLocation
}

// export function getDriveFromPath(fullPath: string): string | null {
//     const parts = fullPath.split("://");
//     if (parts.length < 2) return null;
//     return parts[0];
// }

// export function getPathWithoutDrive(fullPath: string): string {
//     const parts = fullPath.split("://");
//     if (parts.length < 2) return fullPath;
//     return parts.slice(1).join("://");
// }
// export function constructFullPath(drive: string, path: string): string {
//     return `${drive}://${path}`;
// }

// export function addNameToPath(fullPath: string, name: string): string {
//     const drive = getDriveFromPath(fullPath);
//     const path = getPathWithoutDrive(fullPath);
//     const newPath = path === "/" ? `/${name}` : `${path}/${name}`;
//     return constructFullPath(drive ?? "", newPath);
// }

// export function getNameFromPath(fullPath: string): string {
//     const path = getPathWithoutDrive(fullPath);
//     const parts = path.split("/").filter(Boolean);
//     return parts.length === 0 ? "/" : parts[parts.length - 1];
// }
