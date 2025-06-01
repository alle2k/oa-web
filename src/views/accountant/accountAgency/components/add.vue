<template>
  <el-steps
    :active="activeStep"
    finish-status="success"
    align-center
    style="margin-top: 20px"
  >
    <el-step title="选择合同"></el-step>
    <el-step title="填写信息"></el-step>
  </el-steps>

  <div v-if="activeStep === 0" class="step-content">
    <el-form :model="orderForm" :rules="orderFormRules">
      <el-form-item label="合同选择" prop="contractId">
        <el-select
          v-model="orderForm.contractId"
          placeholder="请选择合同"
          clearable
          filterable
        >
          <el-option
            v-for="contract in contracts"
            :key="contract.id"
            :label="contract.auditNo"
            :value="contract.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-button
        type="primary"
        :disabled="!orderForm.contractId"
        @click="nextStep"
        >下一步</el-button
      >
    </el-form>
  </div>

  <div v-else class="step-content">
    <!-- 展示合同基本信息 -->
    <el-descriptions :column="2" border style="margin-bottom: 10px">
      <el-descriptions-item
        label="合同编号："
        span="2"
        label-class-name="desc-label"
        >{{ selectedContract.auditNo }}</el-descriptions-item
      >
      <el-descriptions-item label="付款时间：" label-class-name="desc-label">{{
        selectedContract.paymentTime
      }}</el-descriptions-item>
      <el-descriptions-item
        label="甲方公司名称："
        label-class-name="desc-label"
        >{{ selectedContract.companyName }}</el-descriptions-item
      >
      <el-descriptions-item
        label="甲方联系人姓名："
        label-class-name="desc-label"
        >{{ selectedContract.companyContactUserName }}</el-descriptions-item
      >
      <el-descriptions-item
        label="甲方联系人电话："
        label-class-name="desc-label"
        >{{ selectedContract.companyContactUserTel }}</el-descriptions-item
      >
      <el-descriptions-item
        label="成交金额："
        label-class-name="desc-label"
        class-name="desc-amount"
        >{{ selectedContract.amount }}</el-descriptions-item
      >
    </el-descriptions>
    <!-- 数据录入区域 -->
    <el-form
      :model="formDetails"
      :rules="formDetailsRules"
      ref="formDetailsRef"
    >
      <el-form-item label="服务起止时间：" prop="dateRange">
        <el-date-picker
          v-model="formDetails.dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
          style="width: 292.2px"
        ></el-date-picker>
      </el-form-item>
      <el-form-item label="金额：" label-width="119.45" prop="amount">
        <el-input-number
          v-model="formDetails.amount"
          style="width: 100%"
          precision="2"
          :min="0"
          :max="selectedContract.amount"
        ></el-input-number>
      </el-form-item>
      <!-- 可根据需要添加更多录入项 -->
      <el-button @click="prevStep">上一步</el-button>
      <el-button type="primary" @click="handleSave(formDetailsRef)"
        >保存</el-button
      >
    </el-form>
  </div>
</template>
  
<script setup>
import { reactive, ref, computed } from "vue";
import { pageQuery } from "@/api/core/businessOrder";
import { add } from "@/api/core/accountAgency";

const { proxy } = getCurrentInstance();

const emit = defineEmits(["closeDialog", "refresh"]);

// 假设这是你获取的合同列表
const contracts = ref([]);

const activeStep = ref(0);
const orderForm = reactive({
  contractId: null,
});
const orderFormRules = reactive({
  contractId: [{ required: true, message: "请选择合同", trigger: "change" }],
});
const formDetailsRef = ref(null);
const formDetails = reactive({
  dateRange: null,
  amount: null,
});
const formDetailsRules = reactive({
  dateRange: [
    { required: true, message: "请输入服务起止时间", trigger: "blur" },
  ],
  amount: [{ required: true, message: "请输入金额", trigger: "blur" }],
});

// 根据选择的合同ID获取对应的合同信息
const selectedContract = computed(() => {
  return (
    contracts.value.find((contract) => contract.id === orderForm.contractId) ||
    {}
  );
});

const nextStep = () => {
  // 加载合同基本信息逻辑，可在此调用接口获取更多信息
  activeStep.value = 1;
};

const prevStep = () => {
  activeStep.value = 0;
  proxy.resetForm("formDetailsRef");
};

const handleSave = (form) => {
  // 数据校验和保存逻辑
  if (!form) {
    return;
  }
  form.validate((valid) => {
    if (valid) {
      var data = {
        amount: formDetails.amount,
        serviceBeginDate: formDetails.dateRange[0],
        serviceEndDate: formDetails.dateRange[1],
        orderId: orderForm.contractId,
      };
      add(data).then((response) => {
        proxy.$modal.msgSuccess("新增成功");
        emit("refresh");
      });
      emit("closeDialog");
    }
  });
};

const clearAll = () => {
  orderForm.contractId = null;
  formDetails.dateRange = null;
  formDetails.amount = null;
  activeStep.value = 0;
};

const getList = async () => {
  const res = await pageQuery({
    pageSize: 9999,
    bizType: 1,
    approvalStatus: 1,
    menuFlag: 0,
  });
  contracts.value = res.rows;
};

defineExpose({
  clearAll,
});

getList();
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
  