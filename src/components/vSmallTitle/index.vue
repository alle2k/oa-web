<template>
  <div class="v-small-title">
    <div class="tit">{{ prop.title }}</div>
  </div>
</template>
<script  setup>
  const prop = defineProps({
    title: {
      type: String,
      default: '',
    },
  })
</script>
<style scoped lang="scss">
  .v-small-title {
    margin-bottom: 20px;
    font-size: 14px;
    font-weight: bold;
    color: #000;
    .tit {
      padding-left: 10px;
      border-left: 4px solid #1890ff;
    }
  }
</style>
