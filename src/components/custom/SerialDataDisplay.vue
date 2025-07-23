<script setup lang="ts">

import {nextTick, ref, watch} from "vue";

interface ListItem {
  time: string;  // 注意：String 应改为 string (TypeScript 中使用小写的基本类型)
  content: string;
  isSend: boolean;
}

const props = defineProps({
  displayStatus: Boolean,
  listData: {type: Array as () => ListItem[], default: () => []},

  series: Array
})

// 滚动条
const scrollContainer = ref<HTMLElement | null>(null);
const isAtBottom = ref(true);

// 图表配置
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

watch(() => props.displayStatus, async (newValue) => {
  await nextTick();

  if (newValue) {
    scrollToBottom();
  }
})

watch(() => props.listData.length, async () => {
  await nextTick();
  if (isAtBottom.value) {
    scrollToBottom();
  }
});

</script>

<template>
  <div class="flex-1 rounded shadow overflow-hidden flex flex-col">
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
      <apexchart class="m-1" :series="series" :options="chartOptions" height="100%"/>
    </div>
  </div>
</template>

<style scoped>

</style>