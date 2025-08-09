import { createApp } from 'vue';
import App from './App.vue';

import "./index.css"

import {createPinia} from "pinia";
import VueApexCharts from "vue3-apexcharts";
import 'bootstrap-icons/font/bootstrap-icons.css';
import {router} from "@/router.js";


const pinia = createPinia();

const app = createApp(App)
app.use(router);
app.use(pinia);
app.mount("#app");
app.use(VueApexCharts);