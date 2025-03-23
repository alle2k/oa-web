<template>
  <el-tooltip content="查看">
    <el-button
      link
      type="primary"
      size="small"
      icon="View"
      @click="openDetailDrawer(data)"
    />
  </el-tooltip>
</template>

<script setup>
import { getBizDetailByBizIdAndAuditType } from '@/api/core/approvalSubmissionRecord'

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

const emit = defineEmits([
  'update:detailDrawer',
  'update:nodeList',
  'update:viewDrawer'
])

function openDetailDrawer(...args) {
  emit('update:detailDrawer', true)
  emit('update:viewDrawer', JSON.parse(JSON.stringify(args[0])))
  getBizDetailByBizIdAndAuditType({
    bizId: args[0].id,
    auditType: props.auditType
  }).then((x) => {
    emit('update:nodeList', x.data?.nodeInfo)
  })
}
</script>


