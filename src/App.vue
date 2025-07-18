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
  }else{
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
  <div class="page" style="height: 100%;">
    <header class="navbar navbar-expand-md d-print-none no-top-border">
      <div class="container-xl" style="app-region: drag;">
        <!-- BEGIN NAVBAR LOGO -->
        <span class="fs-1 text-" style="font-family: AlimamaDaoLiTi;">NeoTool</span>
        <!-- END NAVBAR LOGO -->
        <div class="navbar-nav flex-row order-md-last" style="app-region: no-drag;">
          <div class="d-none d-md-flex">
            <SwitchTheme/>
          </div>
          <div class="nav-item dropdown">
            <a href="#" class="nav-link d-flex lh-1 p-0 px-2" data-bs-toggle="dropdown" aria-label="Open user menu">
              <span class="avatar avatar-sm" style=""> </span>
              <div class="d-xl-block ps-2">
                <div>用户登录</div>
                <div class="mt-1 small text-secondary">UI Designer</div>
              </div>
            </a>
            <div class="dropdown-menu dropdown-menu-end dropdown-menu-arrow">
              <a href="#" class="dropdown-item">Status</a>
              <a href="#" class="dropdown-item">Profile</a>
              <a href="#" class="dropdown-item">Feedback</a>
              <div class="dropdown-divider"></div>
              <a href="#" class="dropdown-item">Settings</a>
              <a href="#" class="dropdown-item">Logout</a>
            </div>
          </div>
        </div>
      </div>

      <div class="navbar-nav align-items-center justify-content-center" style="app-region: no-drag">
        <WindowControls/>
      </div>
    </header>

    <div class="page-wrapper">
      <div class="page-body mt-0 mb-0">
        <div class="flex-fill d-flex">
          <div class="col-sm-3 col-xl-2">
            <div class="d-flex flex-column h-100">
              <SerialConfig v-model="serialStatus" @updateDisplayStatus="(msg) => { displayStatus = msg }"/>
              <div class="card">
                <button class="btn btn-primary btn-sm" @click="() => { listData.length = 0; }">清空数据</button>
              </div>
            </div>
          </div>

          <div class="col-sm-9 col-xl-10">
            <div class="card h-100">
              <div v-if="displayStatus" class="card-body overflow-y-auto" style="height: 300px" ref="scrollContainer"
                   @scroll="handleScroll">
                <div v-for="item in listData" class="mt-1">
                  <span class="d-block fs-5">{{ item.time }}</span>
                  <span :class="item.isSend ? 'text-blue' : 'text-green'">{{ item.content }}</span>
                </div>
              </div>

              <div v-else class="card-body d-flex flex-column">
                <div class="flex-fill">
                  <apexchart :series="series" :options="chartOptions" height="100%"></apexchart>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="card d-flex">
          <div class="card-body">
            <label class="form-label">发送</label>
            <div class="input-group">
              <textarea type="text" class="form-control" placeholder="发送至设备...." v-model="serialSendData"/>
              <button class="btn" type="button" @click="writeData">发送</button>
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