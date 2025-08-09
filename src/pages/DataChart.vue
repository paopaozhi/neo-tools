<script setup lang="ts">
import {ref} from "vue";

const series = ref([{
  name: 'series-1',
  data: []
}]);
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

</script>

<template>
    <div class="flex flex-col p-2 h-full gap-2">
      <div class="flex-1 p-2 border rounded">
        <apexchart :series="series" :options="chartOptions" height="100%"/>
      </div>
    </div>
</template>

<style scoped>

</style>