<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { invoke } from '@tauri-apps/api/core';

const SerialStatus_t = Object.freeze({
  OPEN: "关闭串口",
  CLOSE: "打开串口"
});

const emit = defineEmits(['updateDisplayStatus']);

const model = defineModel();

const serialList = ref(["COM1", "COM2"]);
const serialBaudRate = ref(["9600", "115200"]);

const serialStatus = ref(SerialStatus_t.CLOSE)
const portList = ref([]);

const serialPathData = ref("");
const serialBaudRateData = ref(serialBaudRate.value[0]);

const isSerialDisabled = computed(() => serialStatus.value === SerialStatus_t.OPEN);

const displayStatus = ref("display-text");

watch(displayStatus, (newValue) => {
  if (newValue === "display-text") {
    emit("updateDisplayStatus", true);
  } else {
    emit("updateDisplayStatus", false);
  }
})

let intervalId;

/**
 * 串口状态切换 开启串口/关闭串口
 * @returns {Promise<void>}
 */
async function switchSerialStatus() {
  console.log(serialPathData.value, serialBaudRateData.value);

  if (serialStatus.value === SerialStatus_t.CLOSE) {
    // 开启串口
    await invoke('open_port', { config: { port: serialPathData.value, baud_rate: parseInt(serialBaudRateData.value) } }).then(() => {
      // 成功开启串口
      serialStatus.value = SerialStatus_t.OPEN;
      // 开始监听串口数据
      invoke("start_serial_listener").then(() => {
        console.log("串口已打开");
        model.value = {path: `${serialPathData.value}`, isOpen: true};
      }).catch((err) => {
        console.error("监听串口数据失败", err);
      })
    }).catch((error) => {
      // 未开启串口
      console.log("开启串口失败！")
      console.log(error)
      serialStatus.value = SerialStatus_t.CLOSE;
    })
  } else {
    // 关闭串口
    invoke("stop_serial_listener").then(() => {
      invoke('close_port').then(() => {
        serialStatus.value = SerialStatus_t.CLOSE;
        model.value = {path: "", isOpen: false};
      })
    })
  }
}

onMounted(async () => {
  const portListInit = await invoke("serial_list")
  serialPathData.value = portListInit[0];

  // 设置串口定时扫描
  intervalId = setInterval(async () => {
    portList.value = await invoke("serial_list")
    serialList.value = portList.value.map((item) => (item));
  }, 1000);
});

onUnmounted(async () => {
  clearInterval(intervalId);
})
</script>

<template>
  <div class="flex-grow-1 card">
    <div class="card-body">
      <div class="mb-3">
        <label class="form-label">串口列表</label>
        <select class="form-select form-select-sm" v-model="serialPathData" :disabled="isSerialDisabled">
          <option v-for="serial in serialList" :value="serial">{{ serial }}</option>
        </select>
      </div>

      <div class="mb-3">
        <label class="form-label">波特率</label>
        <select class="form-select form-select-sm" id="serial-baud-rate" v-model="serialBaudRateData">
          <option v-for="serial in serialBaudRate" :value="serial">{{ serial }}</option>
        </select>
      </div>

      <div class="me-3">
        <label class="form-label">切换显示模式</label>
        <div class="form-selectgroup">
          <label class="form-selectgroup-item">
            <input type="radio" name="icons" value="display-text" class="form-selectgroup-input"
              v-model="displayStatus" />
            <span class="form-selectgroup-label">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                class="icon me-1 icon-3">
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M4 8v-2a2 2 0 0 1 2 -2h2" />
                <path d="M4 16v2a2 2 0 0 0 2 2h2" />
                <path d="M16 4h2a2 2 0 0 1 2 2v2" />
                <path d="M16 20h2a2 2 0 0 0 2 -2v-2" />
                <path d="M8 12h8" />
                <path d="M8 9h6" />
                <path d="M8 15h4" />
              </svg>
              文本</span>
          </label>
          <label class="form-selectgroup-item">
            <input type="radio" name="icons" value="display-draw" class="form-selectgroup-input"
              v-model="displayStatus" />
            <span class="form-selectgroup-label">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                class="icon me-1 icon-3">
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M18 11h.009" />
                <path d="M14 15h.009" />
                <path d="M12 6h.009" />
                <path d="M8 10h.009" />
                <path d="M3 21l17 -17" />
                <path d="M3 3v18h18" />
              </svg>
              图像</span>
          </label>
        </div>
      </div>
    </div>

    <div class="card-footer">
      <button type="submit" class="btn ms-auto" @click="switchSerialStatus">{{ serialStatus }}</button>
    </div>
  </div>
</template>

<style scoped></style>