<template>
  <el-tooltip content="重新提交">
    <el-button
      v-show="allowEdit(data)"
      link
      type="success"
      size="small"
      icon="Edit"
      @click="handleClick(data)"
    />
  </el-tooltip>
</template>
    
<script setup>
const props = defineProps({
  row: {
    type: Object,
    default: () => {}
  }
})

const emit = defineEmits(['openEditDrawer'])

const data = computed(() => props.row)

function allowEdit(row, index) {
  return (
    row.approvalStatus === 4 ||
    row.approvalStatus === 2 ||
    row.approvalStatus === 5
  )
}

function handleClick() {
  emit('openEditDrawer', arguments[0])
}
</script>
