<template>
  <el-select
    placeholder="请选择审批状态"
    style="width: 240px"
    clearable
    v-model="modelValue"
  >
    <el-option
      v-for="item in options"
      :key="item.value"
      :label="item.label"
      :value="item.value"
    />
  </el-select>
</template>

<script setup>
const modelValue = defineModel('modelValue')

const options = ref([
  { label: '审批中', value: 0 },
  { label: '审批通过', value: 1 },
  { label: '已拒绝', value: 2 },
  { label: '已撤销', value: 4 },
  { label: '已退回', value: 5 }
])
</script>
