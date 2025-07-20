// useTheme.ts
import {ref, watchEffect} from 'vue';

import {storeToRefs} from "pinia";
import {useMainStore} from "../store";

export function useTheme() {
    const themeStorageKey = "tablerTheme";
    const mainStore = useMainStore()
    const {theme} = storeToRefs(mainStore);
    const defaultTheme = theme ? 'dark' : 'light';
    const selectedTheme = ref<string>(defaultTheme);

    // 初始化主题
    const initTheme = () => {
        const searchParams = new URLSearchParams(window.location.search);
        const paramTheme = searchParams.get('theme');

        if (paramTheme) {
            localStorage.setItem(themeStorageKey, paramTheme);
            selectedTheme.value = paramTheme;
        } else {
            const storedTheme = localStorage.getItem(themeStorageKey);
            selectedTheme.value = storedTheme || defaultTheme;
        }

        applyTheme(selectedTheme.value);
    };

    // 应用主题到 body
    const applyTheme = (theme: string) => {
        if (theme === 'dark') {
            document.documentElement.setAttribute("data-theme", theme);
        } else {
            document.documentElement.removeAttribute("data-theme");
        }
    };

    // 切换主题
    const toggleTheme = () => {
        selectedTheme.value = selectedTheme.value === 'dark' ? 'light' : 'dark';
        localStorage.setItem(themeStorageKey, selectedTheme.value);
        applyTheme(selectedTheme.value);
    };

    // 监听主题变化
    watchEffect(() => {
        applyTheme(selectedTheme.value);
    });

    // 初始化
    initTheme();

    return {
        selectedTheme,
        toggleTheme,
    };
}