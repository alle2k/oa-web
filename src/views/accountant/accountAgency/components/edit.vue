<template>
  <el-dialog
    v-model="dialogVisible"
    title="重新提交"
    @close="closeDialog"
    :close-on-click-modal="false"
  >
    <!-- 展示合同基本信息 -->
    <el-descriptions
      :column="2"
      border
      style="margin-bottom: 10px"
      class="step-content"
    >
      <el-descriptions-item
        label="合同编号："
        span="2"
        label-class-name="desc-label"
        >{{ modifyForm.orderAuditNo }}</el-descriptions-item
      >
      <el-descriptions-item label="付款时间：" label-class-name="desc-label">{{
        modifyForm.paymentTime
      }}</el-descriptions-item>
      <el-descriptions-item
        label="甲方公司名称："
        label-class-name="desc-label"
        >{{ modifyForm.companyName }}</el-descriptions-item
      >
      <el-descriptions-item
        label="甲方联系人姓名："
        label-class-name="desc-label"
        >{{ modifyForm.companyContactUserName }}</el-descriptions-item
      >
      <el-descriptions-item
        label="甲方联系人电话："
        label-class-name="desc-label"
        >{{ modifyForm.companyContactUserTel }}</el-descriptions-item
      >
      <el-descriptions-item
        label="成交金额："
        label-class-name="desc-label"
        class-name="desc-amount"
        >{{ modifyForm.orderAmount }}</el-descriptions-item
      >
    </el-descriptions>
    <el-form
      :model="modifyForm"
      style="margin-top: 20px"
      :rules="rules"
      ref="modifyFormRef"
    >
      <el-form-item label="服务起止时间：" prop="dateRange">
        <el-date-picker
          v-model="modifyForm.dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          @change="test"
          value-format="YYYY-MM-DD"
          style="width: 292.2px"
        ></el-date-picker>
      </el-form-item>
      <el-form-item label="金额：" label-width="119.45" prop="amount">
        <el-input-number
          v-model="modifyForm.amount"
          style="width: 100%"
          precision="2"
          :min="0"
          :max="modifyForm.freeAmount"
        ></el-input-number>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="closeDialog">取消</el-button>
      <el-button type="primary" @click="submitModifyForm(modifyFormRef)"
        >保存</el-button
      >
    </template>
  </el-dialog>
</template>

<script setup>
import { modify, add } from '@/api/core/accountAgency'

const { proxy } = getCurrentInstance()

const props = defineProps({
  dialogVisible: {
    type: Boolean,
    required: true
  },
  modifyForm: {
    type: Object,
    required: true
  }
})

const dialogVisible = ref(props.dialogVisible)
watch(
  () => props.dialogVisible,
  (newVal) => {
    dialogVisible.value = newVal
  }
)
var modifyForm = ref(props.modifyForm)
watch(
  () => props.modifyForm,
  (newVal) => {
    modifyForm.value = newVal
  }
)

var emit = defineEmits(['update:dialogVisible', 'refresh'])

const rules = reactive({
  dateRange: [
    { required: true, message: '请输入服务起止时间', trigger: 'blur' }
  ],
  amount: [{ required: true, message: '请输入金额', trigger: 'blur' }]
})

var modifyFormRef = ref(null)
function submitModifyForm(form) {
  if (!form) {
    return
  }
  form.validate((valid) => {
    if (valid) {
      var method = modify
      if (
        modifyForm.value.approvalStatus === 2 ||
        modifyForm.value.approvalStatus === 4
      ) {
        method = add
      }
      method(modifyForm.value).then((response) => {
        proxy.$modal.msgSuccess('修改成功')
        closeDialog()
        emit('refresh')
      })
    }
  })
}

function closeDialog() {
  dialogVisible.value = false
  emit('update:dialogVisible', false)
  proxy.resetForm('modifyFormRef')
}
</script>

<style scoped lang="scss">
.step-content {
  margin-top: 20px;

  :deep(.desc-label) {
    font-weight: bold;
    color: #606266;
  }

  :deep(.desc-amount) {
    font-weight: bold;
    color: #f56c6c;
  }
}
</style>