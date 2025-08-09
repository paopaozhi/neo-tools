<script setup lang="ts">

import {ChartLine, Settings} from "lucide-vue-next";
import {Button} from "@/components/ui/button";
</script>

<template>
  <Button variant="ghost">
    <component :is="Settings"/>
  </Button>

  <Button variant="ghost">
    <component :is="ChartLine"/>
  </Button>
</template>

<style scoped>

</style>