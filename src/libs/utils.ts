import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
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
