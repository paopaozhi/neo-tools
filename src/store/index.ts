// store/index.ts
import {defineStore} from 'pinia'
import {ref} from "vue";
import Cookies from "js-cookie";

export const useMainStore = defineStore('main', () => {
    const isLogin = ref(false)
    const roles = ref("/")
    // 查询当前系统主题
    const isDarkTheme = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = ref(isDarkTheme)

    if (Cookies.get("token")) {
        isLogin.value = true;
    }

    return {
        isLogin,
        roles,
        theme
    }
})