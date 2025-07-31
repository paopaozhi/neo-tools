<script setup>
import {nextTick, onMounted, ref, watch, computed} from "vue";
import SerialConfig from "@/components/SerialConfig.vue";
import SwitchTheme from "@/components/SwitchTheme.vue";
import WindowControls from '@/components/WindowControls.vue';
import {invoke} from "@tauri-apps/api/core";
import {listen} from "@tauri-apps/api/event";
import SerialDataDisplay from "@/components/custom/SerialDataDisplay.vue";
import SerialSendQuickly from "@/components/custom/SerialSendQuickly.vue";

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

/// 监听串口数据
listen("serial-data", (event) => {
  listData.value.push({
    time: new Date().toLocaleString(),
    content: event.payload,
    isSend: false,
  });
  extractNumbers(event.payload);
});
</script>
<template>
  <div class="flex flex-col h-screen">
    <!-- 顶部栏 -->
    <header class="flex items-center justify-between px-4 py-2"
            style="app-region: drag;">
      <div class="text-xl font-bold" style="font-family: AlimamaDaoLiTi;">NeoTool</div>
      <div class="flex items-center gap-2">
        <SwitchTheme/>
        <WindowControls/>
      </div>
    </header>

    <!-- 页面内容 -->
    <div class="grid grid-cols-12 m-1 h-full">
      <!-- 左侧串口配置栏 -->
      <div class="col-span-3 xl:col-span-2">
        <div class="h-full w-full flex flex-col gap-2 p-2">
          <div class="border border-base-300 h-full rounded">
            <SerialConfig v-model="serialStatus" @updateDisplayStatus="(msg) => { displayStatus = msg }"/>
            <div class="card">
              <div class="card-body">
                <button class="btn"
                        @click="() => { listData.length = 0; }">
                  清空数据
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧主区域 -->
      <div class="col-span-9 xl:col-span-10 p-2">
        <div class="grid grid-rows-[3fr_1fr] h-full">
          <div class="row-span-3">
            <!-- 数据区域 -->
            <SerialDataDisplay :display-status="displayStatus" :series="series" :list-data="listData"/>
          </div>

          <!-- 发送区域 -->
          <div class="row-span-1">
            <div class="rounded mt-2 p-4 border border-base-300">
              <label class="block text-sm font-medium mb-1">发送</label>
              <div class="flex gap-2">
            <textarea
                class="textarea flex-1/2 p-2 rounded border text-sm resize-none"
                rows="2"
                placeholder="发送至设备...."
                v-model="serialSendData"
            ></textarea>
                <button class="btn h-auto" @click="writeData">发送</button>
              </div>
            </div>
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