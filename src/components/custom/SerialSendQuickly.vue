<script setup lang="ts">
import {nextTick, onMounted, ref} from "vue";
import {quicklyInfo} from "@/api";

const childComponent = ref<HTMLElement | null>(null)
const parentHeight = ref(0)
const boxHeigh = ref(30)

const quickList = ref<Array<string>>([])

const show = ref(false)

const form = ref({
  username: '',
  email: ''
})

function submitForm() {
  quickList.value.push(form.value["username"])
  console.log('提交数据:', form.value)
  show.value = false // 提交后关闭弹窗
}

function sendItem(index: number) {
  const msg = quickList.value[index]
  console.log(msg)
}

function deleteItem(index: number) {
  quickList.value.splice(index, 1)
}

onMounted(async () => {
  await nextTick();
  quickList.value = await quicklyInfo()

  if (childComponent.value) {
    const el = document.querySelector('#child')
    parentHeight.value = el?.parentElement?.offsetHeight || 0
    console.log('父容器高度:', parentHeight.value)
    boxHeigh.value = parentHeight.value - 2;
  }
})
</script>

<template>
  <div id="child" class="flex flex-col rounded border border-base-300 overflow-hidden min-w-[240px]"
       ref="childComponent">
    <div class="overflow-y-auto" :style="{height: boxHeigh + 'px'}">
      <div>
        <div class="flex p-2 pb-0">
          <div class="p-2 pb-2 text-sm font-bold">快捷发送</div>
          <button class="btn btn-sm btn-square ms-auto" @click="show = true">
            <span class="bi bi-plus-lg"></span>
          </button>
        </div>

        <div class="divider m-0"></div>

        <div v-for="(item,index) in quickList" class="flex flex-row gap-2 p-2">
          <span class="text-sm my-auto">{{ item }}</span>
          <span class="invisible"></span>
          <div class="flex ms-auto gap-1">
            <button class="btn btn-sm btn-square" @click="sendItem(index)">
              <span class="bi bi-send"></span>
            </button>
            <button class="btn btn-sm btn-square btn-soft btn-error" @click="deleteItem(index)">
              <span class="bi bi-trash"></span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 模态框 -->
  <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 bg-opacity-50"
      @click.self="show = false"
  >
    <div
        class="bg-white p-6 rounded-lg w-full max-w-md shadow-lg relative"
    >
      <!-- 关闭按钮 -->
      <button
          class="absolute top-2 right-2 text-gray-500 hover:text-red-500"
          @click="show = false"
      >
        <span class="bi bi-x-lg"></span>
      </button>

      <h2 class="text- font-bold mb-4">添加快捷指令</h2>

      <form @submit.prevent="submitForm" class="space-y-4">
        <fieldset>
          <legend class="fieldset-legend">快捷指令</legend>
          <input
              v-model="form.username"
              type="text"
              class="input input-sm w-full"
              required
          />
        </fieldset>
        <button
            type="submit"
            class="btn btn-primary btn-sm"
        >
          添加
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>

</style>