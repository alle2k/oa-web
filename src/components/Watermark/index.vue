<template>
  <div></div>
</template>

<script setup>
import { onMounted, watch } from 'vue'
import watermark from '@/utils/watermaker'
import useUserStore from '@/store/modules/user'

const userStore = useUserStore()

const updateWatermark = () => {
  watermark({
    watermark_txt: userStore.nickName || 'OA系统'
  })
}

// 监听用户名变化
watch(
  () => userStore.name,
  (newName) => {
    updateWatermark()
  }
)

// 组件挂载时添加水印
onMounted(() => {
  updateWatermark()
})
</script>
