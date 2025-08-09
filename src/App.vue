<script setup>
import {ref, computed, watch} from "vue";
import {useRouter} from "vue-router";

import SwitchTheme from "@/components/SwitchTheme.vue";
import WindowControls from '@/components/WindowControls.vue';

import {Settings, ChartLine} from "lucide-vue-next"
import {Button} from "@/components/ui/button/index.js";

const router = useRouter()

const activePage = ref('setting'); // 默认显示设置页
const settingVariant = computed(() => activePage.value === '/' ? 'secondary' : 'ghost')
const chartLineVariant = computed(() => activePage.value === '/data-chart' ? 'secondary' : 'ghost')

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
      <div class="flex">
        <div class="flex flex-col w-14 items-center gap-2 py-2 border-r-2 border-base-300 h-full">
          <RouterLink to="/">
            <Button :variant="settingVariant">
              <component :is="Settings"/>
            </Button>
          </RouterLink>

          <RouterLink to="/data-chart">
            <Button :variant="chartLineVariant">
              <component :is="ChartLine"/>
            </Button>
          </RouterLink>
        </div>
      </div>

      <main class="flex flex-1">
        <RouterView/>
      </main>
    </div>
  </div>
</template>

<style>
.no-top-border {
  padding-top: 0;
}
</style>