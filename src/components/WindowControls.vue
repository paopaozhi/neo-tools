<script setup>
import {ref} from 'vue';
import {Window} from '@tauri-apps/api/window';

const appWindow = new Window('main');
const isMaximized = ref(false);

function minimize() {
  appWindow.minimize();
}

function close() {
  appWindow.close();
}

function toggleMaximize() {
  // 示例逻辑（需你补充真实实现）
  isMaximized.value = !isMaximized.value
  // 可使用 Tauri 事件机制通知主进程最大化窗口
}
</script>

<template>
  <div class="flex gap-[2px] select-none" style="app-region: no-drag">
    <!-- 最小化按钮 -->
    <button @click="minimize" title="最小化" class="window-btn">
      <i class="bi bi-dash"></i>
    </button>

    <!-- 最大化按钮 -->
    <button @click="toggleMaximize" title="还原窗口" class="window-btn">
      <i :class="isMaximized ? 'bi bi-square' : 'bi bi-fullscreen-exit'"></i>
    </button>

    <!-- 关闭按钮 -->
    <button @click="close" title="关闭" class="window-btn close-btn">
      <i class="bi bi-x-lg"></i>
    </button>
  </div>
</template>

<style>
/* 默认亮色模式 */
:root {
  --window-icon-color: #000;
  --window-btn-hover-bg: rgba(0, 0, 0, 0.1); /* 悬停时黑色半透明，更明显 */
}

/* 深色模式下覆盖 */
html[data-theme="dark"] {
  --window-icon-color: #fff !important;
  --window-btn-hover-bg: rgb(64, 64, 64);
}

.window-btn {
  width: 36px;
  height: 36px;
  background: transparent;
  color: var(--window-icon-color, #000); /* 根据主题自动适配图标颜色 */
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: background-color 0.2s ease;
}

.window-btn:hover {
  background-color: var(--window-btn-hover-bg);
}

.close-btn:hover {
  background-color: #e81123;
}
</style>
