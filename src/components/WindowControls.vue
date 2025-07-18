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
  // window.electronAPI.toggleMaximize(); // 你需定义这个 API
}
</script>

<template>
  <div class="window-controls d-flex" style="gap: 2px; app-region: no-drag">
    <button class="window-btn" @click="minimize" title="最小化">
      <i class="bi bi-dash"></i>
    </button>
    <button class="window-btn" @click="toggleMaximize" title="还原窗口">
      <i :class="isMaximized ? 'bi bi-square' : 'bi bi-fullscreen-exit'"></i>
    </button>
    <button class="window-btn close-btn" @click="close" title="关闭">
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
body[data-bs-theme="dark"] {
  --window-icon-color: #fff !important;
  --window-btn-hover-bg: rgba(255, 255, 255, 0.1);
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
