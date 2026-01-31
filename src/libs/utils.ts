import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function formatDate(ts?: number): string {
    // Format timestamp as "YYYY-MM-DD"
    if (!ts) return "Date".padStart(10, "\u00A0"); // non-breaking spaces
    const date = new Date(ts);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function formatTime(ts?: number): string {
    // Format timestamp as "HH:MM:SS"
    if (!ts) return "Time".padStart(8, "\u00A0"); // non-breaking spaces
    const date = new Date(ts);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}


export function formatBytes(bytes: number, decimals = 2): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export async function hasNonTextCharsInStart(blob: Blob): Promise<boolean> {
    //test 1024 bytes for 0-8 control characters
    const text = await blob.slice(0, 1024).text();
    let controlChars = 0;
    for (let i = 0; i < text.length; i++) {
        const charCode = text.charCodeAt(i);
        if (charCode < 32 && charCode !== 9 && charCode !== 10 && charCode !== 13) {
            controlChars++;
        }
    }
    console.log(`Control chars: ${controlChars} / ${text.length}`);
    return controlChars / text.length > 0.1;
}

export async function isImage(blob: Blob): Promise<boolean> {
    // 1. Basic type check (fastest)
    if (!blob.type.startsWith('image/')) return false;

    const url = URL.createObjectURL(blob);

    try {
        return await new Promise((resolve) => {
            const img = new Image();

            img.onload = () => {
                // Success! Clean up and return true
                URL.revokeObjectURL(url);
                resolve(img.width > 0 && img.height > 0);
            };

            img.onerror = () => {
                // Not a valid image
                URL.revokeObjectURL(url);
                resolve(false);
            };

            img.src = url;
        });
    } catch {
        URL.revokeObjectURL(url);
        return false;
    }
}


export async function blobToTextIfPossible(blob: Blob, offset = 0, length?: number): Promise<string | null> {
    if (length === undefined) {
        length = Math.min(1024 * 1024, blob.size - offset);
    }
    const decoder = new TextDecoder("utf-8", { fatal: true });
    const arrayBuffer = await blob.slice(offset, offset + length).arrayBuffer();
    try {
        return decoder.decode(arrayBuffer);
    } catch {
        return null;
    }
}

export async function blobToHexView(blob: Blob, offset = 0, length?: number): Promise<string> {
    if (length === undefined) {
        length = Math.min(16 * 1024, blob.size - offset);
    }
    //return "xxx";
    const arrayBuffer = await blob.slice(offset, offset + length).arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let hexView = '';
    for (let i = 0; i < bytes.length; i += 16) {
        const chunk = bytes.slice(i, i + 16);
        const hexBytes = Array.from(chunk).map(b => b.toString(16).padStart(2, '0')).join(' ');
        const asciiChars = Array.from(chunk).map(b => (b >= 32 && b <= 126) ? String.fromCharCode(b) : '.').join('');
        hexView += `${(offset + i).toString(16).padStart(8, '0')}  ${hexBytes.padEnd(47, ' ')}  |${asciiChars}|\n`;
    }
    return hexView;
}
