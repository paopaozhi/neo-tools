<script setup>
import {computed, onMounted, onUnmounted, ref, watch} from "vue";
import {invoke} from '@tauri-apps/api/core';

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

const displayStatus = ref(true);

watch(displayStatus, (newValue) => {
  if (newValue) {
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
    await invoke('open_port', {
      config: {
        port: serialPathData.value,
        baud_rate: parseInt(serialBaudRateData.value)
      }
    }).then(() => {
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
  <div class="card rounded">
    <div class="card-body">
      <fieldset class="fieldset">
        <label class="fieldset-legend">串口列表</label>
        <select class="select select-sm" v-model="serialPathData" :disabled="isSerialDisabled">
          <option v-for="serial in serialList" :value="serial">{{ serial }}</option>
        </select>
      </fieldset>

      <fieldset class="fieldset">
        <label class="fieldset-legend">波特率</label>
        <select class="select select-sm" id="serial-baud-rate" v-model="serialBaudRateData">
          <option v-for="serial in serialBaudRate" :value="serial">{{ serial }}</option>
        </select>
      </fieldset>

      <fieldset class="fieldset">
        <label class="fieldset-legend">切换显示模式</label>
        <div class=" flex">
          <input type="checkbox" checked="checked" class="toggle mr-2" v-model="displayStatus"/>
          <span class="text-base">{{ displayStatus ? "文本" : "图像" }}</span>
        </div>
      </fieldset>

      <button type="submit" class="btn" @click="switchSerialStatus">{{ serialStatus }}</button>
    </div>
  </div>
</template>

<style scoped></style>