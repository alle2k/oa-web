<template>
  <div class="drawer">
    <el-drawer
      v-model="detailDrawer"
      title="详情"
      direction="rtl"
      @close="closeDetailDrawer"
    >
      <template #default>
        <div style="position: relative; margin-bottom: 20px">
          <el-image
            :src="approvalStatusImgMap[viewDrawer.approvalStatus]"
            style="width: 120px; height: 120px; position: absolute; right: 0"
          />
        </div>
        <el-descriptions column="1">
          <el-descriptions-item label="审批编号：">
            <span style="margin-left: 42px">{{ viewDrawer.auditNo }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="付款时间：">
            <span style="margin-left: 42px">{{
              parseTime(new Date(viewDrawer.paymentTime))
            }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="甲方公司名称：">
            <el-button
              v-if="checkPermi(['biz:order:sensitive'])"
              type="primary"
              @click="viewCompanyName(viewDrawer)"
              text
              >{{ viewDrawer.companyNameShow }}</el-button
            >
            <span v-else style="margin-left: 14px">{{
              viewDrawer.companyNameShow
            }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="甲方联系人姓名：">
            <el-button
              v-if="checkPermi(['biz:order:sensitive'])"
              type="primary"
              @click="viewCompanyContactUserName(viewDrawer)"
              text
              style="padding-left: 0px"
              >{{ viewDrawer.companyContactUserNameShow }}</el-button
            >
            <span v-else>{{ viewDrawer.companyContactUserNameShow }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="甲方联系人电话：">
            <el-button
              v-if="checkPermi(['biz:order:sensitive'])"
              type="primary"
              @click="viewCompanyContactUserTel(viewDrawer)"
              text
              style="padding-left: 0px; padding-right: 0px"
            >
              {{ viewDrawer.companyContactUserTelShow }}
            </el-button>
            <span v-else>{{ viewDrawer.companyContactUserTelShow }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="成交金额：">
            <span style="margin-left: 42px">{{ viewDrawer.amount }}</span>
          </el-descriptions-item>
        </el-descriptions>
        <ApprovalFlow
          :nodeList="nodeList"
          :approvalStatus="viewDrawer.approvalStatus"
          :auditType="1002"
          :bizId="viewDrawer.id"
          :visibleAudit="name !== 'AccountAgencyApply'"
          @refresh="approvalFlowRefresh"
        />
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
import { parseTime } from '@/utils/oa'
import { checkPermi } from '@/utils/permission'
import adoptPng from '@/assets/images/adopt.png'
import waitPng from '@/assets/images/wait.png'
import refusePng from '@/assets/images/refuse.png'
import revokePng from '@/assets/images/revoke.png'
import returnPng from '@/assets/images/return.png'

const props = defineProps({
  viewDrawer: {
    type: Object,
    required: true
  },
  detailDrawer: {
    type: Boolean,
    required: true
  },
  nodeList: {
    type: Array,
    required: true
  }
})

const viewDrawer = computed(() => props.viewDrawer)
const detailDrawer = ref(props.detailDrawer)
const nodeList = computed(() => props.nodeList)
const { name } = useRoute()

watch(
  () => props.detailDrawer,
  (newVal) => {
    detailDrawer.value = newVal
  }
)

const emit = defineEmits(['update:detailDrawer', 'refresh'])

const approvalStatusImgMap = reactive({
  1: adoptPng,
  0: waitPng,
  2: refusePng,
  4: revokePng,
  5: returnPng
})

function closeDetailDrawer() {
  detailDrawer.value = false
  emit('update:detailDrawer', false)
}

function approvalFlowRefresh() {
  closeDetailDrawer()
  emit('refresh')
}

function viewCompanyName(row) {
  if (row.companyNameVisitFlag) {
    row.companyNameVisitFlag = !row.companyNameVisitFlag
    row.companyNameShow = hideCompanyName(row)
    return
  }
  row.companyNameVisitFlag = !row.companyNameVisitFlag
  row.companyNameShow = row.companyName
}

function viewCompanyContactUserName(row) {
  if (row.companyContactUserNameVisitFlag) {
    row.companyContactUserNameVisitFlag = !row.companyContactUserNameVisitFlag
    row.companyContactUserNameShow = hideCompanyContactUserName(row)
    return
  }
  row.companyContactUserNameVisitFlag = !row.companyContactUserNameVisitFlag
  row.companyContactUserNameShow = row.companyContactUserName
}

function viewCompanyContactUserTel(row) {
  if (row.companyContactUserTelVisitFlag) {
    row.companyContactUserTelVisitFlag = !row.companyContactUserTelVisitFlag
    row.companyContactUserTelShow = hideCompanyContactUserTel(row)
    return
  }
  row.companyContactUserTelVisitFlag = !row.companyContactUserTelVisitFlag
  row.companyContactUserTelShow = row.companyContactUserTel
}
</script>

<script>
function hideCompanyName(dest) {
  return (
    dest.companyName.substr(0, 2) +
    (function () {
      let str = ''
      let hideLength = dest.companyName.length - 4
      for (let i = 0; i < hideLength; i++) {
        str += '*'
      }
      return str
    })() +
    dest.companyName.substr(-2, 2)
  )
}

function hideCompanyContactUserName(dest) {
  if (dest.companyContactUserName.length <= 3) {
    return (
      dest.companyContactUserName.substr(0, 1) +
      Array.prototype.map
        .call(dest.companyContactUserName.substr(1), () => '*')
        .join('')
    )
  }
  return (
    dest.companyContactUserName.substr(0, 2) +
    Array.prototype.map
      .call(dest.companyContactUserName.substr(2), () => '*')
      .join('')
  )
}

function hideCompanyContactUserTel(dest) {
  return (
    dest.companyContactUserTel.substr(0, 3) +
    '****' +
    dest.companyContactUserTel.substr(-4)
  )
}
</script>
