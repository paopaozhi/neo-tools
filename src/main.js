import { createApp } from 'vue';
import App from './App.vue';

import "./index.css"

import "@tabler/core/dist/css/tabler.min.css"
import "@tabler/core/dist/css/tabler-socials.css"
import "@tabler/core/dist/css/tabler-payments.css"
import "@tabler/core/dist/css/tabler-vendors.css"
import "@tabler/core/dist/css/tabler-marketing.css"
import "@tabler/core/dist/css/tabler-themes.css"
import "@tabler/core/dist/js/tabler.min.js"
import {createPinia} from "pinia";
import VueApexCharts from "vue3-apexcharts";
import 'bootstrap-icons/font/bootstrap-icons.css';


const pinia = createPinia();

const app = createApp(App)
app.use(pinia)
app.mount("#app");
app.use(VueApexCharts);