<script setup>
import {ref, watch} from "vue";
import {useRouter} from "vue-router";

import SwitchTheme from "@/components/SwitchTheme.vue";
import WindowControls from '@/components/WindowControls.vue';

import {Settings, ChartLine} from "lucide-vue-next"
import {Button} from "@/components/ui/button/index.js";

const router = useRouter()

const activePage = ref('/'); // 默认是首页

watch(() => router.currentRoute.value, (newValue) => {
      activePage.value = newValue.fullPath
    }
);
</script>

<template>
  <div class="flex flex-col h-screen">
    <!-- 顶部栏 -->
    <header class="flex items-center justify-between border-b-2 border-b-base-300 bg-base-200"
            style="app-region: drag;">
      <div class="text-xl font-bold px-4" style="font-family: AlimamaDaoLiTi;">NeoTool</div>
      <div class="flex items-center gap-2">
        <SwitchTheme/>
        <WindowControls/>
      </div>
    </header>

    <!-- 页面内容 -->
    <div class="flex flex-1 z-20">
      <!-- 左侧导航栏 -->
      <div class="flex">
        <div class="flex flex-col w-14 items-center gap-2 py-2 border-r-2 border-base-300 h-full">
          <!-- 设置页按钮 -->
          <RouterLink to="/" custom v-slot="{ navigate, isActive }">
            <Button
                @click="navigate"
                :variant="isActive ? 'secondary' : 'ghost'"
                class="transition-all duration-300 ease-in-out transform"
            >
              <component :is="Settings" class="stroke-current"/>
            </Button>
          </RouterLink>

          <!-- 数据图表按钮 -->
          <RouterLink to="/data-chart" custom v-slot="{ navigate, isActive }">
            <Button
                @click="navigate"
                :variant="isActive ? 'secondary' : 'ghost'"
                class="transition-all duration-300 ease-in-out transform"
            >
              <component :is="ChartLine"/>
            </Button>
          </RouterLink>
        </div>
      </div>

      <!-- 主内容区，带路由切换动画 -->
      <main class="flex flex-1 overflow-hidden">
        <transition name="fade-slide" mode="out-in">
          <RouterView/>
        </transition>
      </main>
    </div>
  </div>
</template>

<style>
/* 页面切换动画 */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.7s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(10px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}
</style>
