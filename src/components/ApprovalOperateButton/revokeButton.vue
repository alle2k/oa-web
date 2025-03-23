<template>
  <el-tooltip content="撤销申请">
    <el-button
      v-show="allowRevoke(data)"
      link
      type="danger"
      size="small"
      icon="Pointer"
      @click="handleClick(data)"
    />
  </el-tooltip>
</template>

<script setup>
import useUserStore from '@/store/modules/user'
import { rollback } from '@/api/core/flowable'

const props = defineProps({
  row: {
    type: Object,
    default: () => {}
  },
  auditType: {
    type: Number,
    default: 1001
  }
})
const data = computed(() => props.row)

const emit = defineEmits(['refresh'])

const { proxy } = getCurrentInstance()

const userStore = useUserStore()

function allowRevoke(row) {
  return (
    row.approvalStatus === 0 &&
    (userStore.id === row.createUser ||
      userStore.permissions?.includes('*:*:*'))
  )
}

function handleClick(row) {
  proxy.$modal.confirm('确定撤销申请吗？').then(() => {
    var data = {
      id: row.id,
      operateType: 1,
      auditType: props.auditType
    }
    rollback(data).then((response) => {
      proxy.$modal.msgSuccess('撤销成功')
      emit('refresh')
    })
  })
}
</script>