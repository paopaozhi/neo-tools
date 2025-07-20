<script setup>
import {nextTick, onMounted, ref, watch, computed} from "vue";
import SerialConfig from "@/components/SerialConfig.vue";
import SwitchTheme from "@/components/SwitchTheme.vue";
import WindowControls from '@/components/WindowControls.vue';
import {invoke} from "@tauri-apps/api/core";
import {listen} from "@tauri-apps/api/event";

const listData = ref([]);
const serialSendData = ref("");

const serialStatus = ref({path: "", isOpen: false,});

const VISIBLE_POINTS = 30;
const chartStart = ref(0);

const displayStatus = ref(true);

const serial_1 = []

const chartOptions = ref({
  chart: {
    id: 'vuechart-example',
    toolbar: {
      show: false,
    },
  },
  stroke: {
    width: 2, // 设置为 1px，变细
    curve: 'smooth'
  },
  tooltip: {enable: false},
  xaxis: {
    labels: {
      show: false
    },
    axisBorder: {
      show: false
    },
    axisTicks: {
      show: false
    }
  },
});
const series = ref([{
  name: 'series-1',
  data: []
}]);

function miniWindow() {
  window.electronAPI.minimize();
}

function closeWindow() {
  window.electronAPI.close();
}

async function writeData() {
  if (serialStatus.value.isOpen === true) {
    const data = new TextEncoder().encode(serialSendData.value);
    invoke('write_serial', {data: Array.from(data)}).then(() => {
      listData.value.push({time: new Date().toLocaleString(), content: serialSendData.value, isSend: true});
    });
  } else {
    // todo: 当未打开串口时，会提示需要打开串口后使用
  }
}

const scrollContainer = ref(null);
const isAtBottom = ref(true);

function scrollToBottom() {
  if (scrollContainer.value) {
    scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight;
  }
}

function handleScroll() {
  const el = scrollContainer.value;
  if (!el) return;

  const threshold = 20; // 容许误差
  const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
  isAtBottom.value = distanceToBottom < threshold;
}

function extractNumbers(str) {
  // 匹配形如 $123<<、$45.67<< 的内容
  const regex = /\$(\d+(\.\d+)?)(?=<<)/g;
  let match;

  while ((match = regex.exec(str)) !== null) {
    // match[1] 是括号中的内容（即数字）
    const x = serial_1.length + 1;
    serial_1.push({x, y: parseFloat(match[1])});
  }

  const start = Math.max(0, serial_1.length - VISIBLE_POINTS);
  const end = start + VISIBLE_POINTS;
  series.value[0].data = serial_1.slice(start, end);
  console.log("start: ", start, "end: ", end);
  console.log(series.value[0].data);
}

function getListDataSize() {
  // 估算 listData 的总字节数（只统计 content 字符串，UTF-8 编码）
  return listData.value.reduce((sum, item) => {
    return sum + (item.content ? new TextEncoder().encode(item.content).length : 0);
  }, 0);
}

function trimListDataTo1MB() {
  const MAX_SIZE = 1024 * 1024; // 1MB
  while (getListDataSize() > MAX_SIZE && listData.value.length > 0) {
    listData.value.shift();
  }
}

// 侦听 listData 内容变化
watch(listData, () => {
  trimListDataTo1MB();
}, {deep: true});

watch(() => listData.value.length, async () => {
  await nextTick();
  if (isAtBottom.value) {
    scrollToBottom();
  }
});

watch(displayStatus, async (newValue) => {
  if (newValue === true) {
    await nextTick(); // 等待 DOM 更新完成

    scrollToBottom();
  }
});

/// 监听串口数据
listen("serial-data", (event) => {
  listData.value.push({
    time: new Date().toLocaleString(),
    content: event.payload,
    isSend: false,
  });
  extractNumbers(event.payload);
});

onMounted(() => {
  scrollToBottom(); // 初始自动到底

  // window.electronAPI.onSerialData((data) => {
  //   listData.value.push({
  //     time: new Date().toLocaleString(),
  //     content: data,
  //     isSend: false,
  //   });
  //
  //   extractNumbers(data);
  // });
});
</script>
<template>
  <div class="flex flex-col h-screen">
    <!-- 顶部栏 -->
    <header class="flex items-center justify-between px-4 py-2 border-b border-gray-300 dark:border-gray-700"
            style="app-region: drag;">
      <div class="text-xl font-bold" style="font-family: AlimamaDaoLiTi;">NeoTool</div>
      <div class="flex items-center gap-2">
        <SwitchTheme/>
        <WindowControls/>
      </div>
    </header>

    <!-- 页面内容 -->
    <div class="flex flex-1 overflow-hidden">
      <!-- 左侧串口配置栏 -->
      <div class="w-full max-w-xs flex flex-col gap-2 p-2 border-r border-gray-300 dark:border-gray-700">
        <SerialConfig v-model="serialStatus" @updateDisplayStatus="(msg) => { displayStatus = msg }"/>
        <div class=" rounded shadow p-2">
          <button class="btn"
                  @click="() => { listData.length = 0; }">
            清空数据
          </button>
        </div>
      </div>

      <!-- 右侧主区域 -->
      <div class="flex-1 flex flex-col p-2 overflow-hidden">
        <div class="flex-1  rounded shadow overflow-hidden flex flex-col">
          <!-- 接收数据区域 -->
          <div v-if="displayStatus"
               class="flex-1 overflow-y-auto p-3"
               style="height: 300px"
               ref="scrollContainer"
               @scroll="handleScroll">
            <div v-for="item in listData" class="mb-2 text-sm">
              <div class="text-gray-500 dark:text-gray-400">{{ item.time }}</div>
              <div :class="item.isSend ? 'text-blue-500' : 'text-green-500'">
                {{ item.content }}
              </div>
            </div>
          </div>

          <!-- 图表区域 -->
          <div v-else class="flex-1">
            <apexchart :series="series" :options="chartOptions" height="100%"/>
          </div>
        </div>

        <!-- 发送区域 -->
        <div class="rounded shadow mt-2 p-4">
          <label class="block text-sm font-medium mb-1">发送</label>
          <div class="flex items-start gap-2">
            <textarea
                class="textarea flex-1 p-2 rounded border text-sm resize-none"
                rows="2"
                placeholder="发送至设备...."
                v-model="serialSendData"
            ></textarea>
            <button class="btn" @click="writeData">发送</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.no-top-border {
  padding-top: 0;
}
</style>