<script setup lang="ts">
import {computed} from "vue";
import useTheme from "@/utility/useTheme";

const {selectedTheme, toggleTheme} = useTheme();

const theme = computed(() => {
  return selectedTheme.value != "light";
})
</script>

<template>
  <label class="swap btn btn-square btn-ghost btn-sm">
    <input type="checkbox" v-model="theme" @click="toggleTheme"/>
    <i class="bi-moon swap-on fill-current icon-style"></i>
    <i class="bi-sun swap-off fill-current icon-style"></i>
  </label>
</template>

<style>
.icon-style {
  font-size: 20px;
}
</style>