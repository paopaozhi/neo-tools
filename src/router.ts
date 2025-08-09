import {createMemoryHistory, createRouter} from 'vue-router'

import HomeView from '@/pages/Home.vue'
import DataChartView from '@/pages/DataChart.vue'

const routes = [
    {path: '/', component: HomeView},
    {path: '/data-chart', component: DataChartView},
]

export const router = createRouter({
    history: createMemoryHistory(),
    routes,
})

