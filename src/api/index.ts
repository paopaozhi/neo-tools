import {isTauri} from "@tauri-apps/api/core";

export async function quicklyInfo(): Promise<Array<string>> {
    if (isTauri()) {
        return []
    } else {
        try {
            const response = await fetch("/api/quickly-info");
            const result: { code: number; data: Array<string> } = await response.json();
            return result.data;
        } catch (err) {
            console.error(err);
            return [];
        }
    }
}

export function addQuicklyInfo() {
    if (isTauri()) {
        return null
    } else {

    }
}