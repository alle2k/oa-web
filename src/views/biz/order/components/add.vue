<template>
  <el-dialog
    v-model="insertDialogVisibleFlag"
    title="保存"
    @close="closeInsertForm"
  >
    <el-form :model="insertForm" :rules="insertRules" ref="insertFormRef">
      <el-form-item label="付款时间：" label-width="133.45" prop="paymentTime">
        <el-date-picker
          v-model="insertForm.paymentTime"
          type="datetime"
          placeholder="请选择付款时间"
          value-format="YYYY-MM-DD HH:mm:ss"
          style="width: 292.2px"
        />
      </el-form-item>
      <el-form-item label="业务类型：" label-width="133.45" prop="bizTypeList">
        <el-select
          v-model="insertForm.bizTypeList"
          placeholder="请选择业务类型"
          multiple
          style="width: 292.2px"
          @change="handleBizTypeChange"
        >
          <el-option label="工商代办" value="0"></el-option>
          <el-option label="代理记账" value="1"></el-option>
          <el-option label="代理记账续期" value="6"></el-option>
          <el-option label="公司注销" value="2"></el-option>
          <el-option label="知识产权" value="3"></el-option>
          <el-option label="项目申报" value="4"></el-option>
          <el-option label="其他" value="5"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item
        label="原订单合同"
        label-width="133.45"
        prop="originalOrder"
        v-show="originalOrderShowFlag"
      >
        <el-select
          v-model="insertForm.contractId"
          @change="handleVisibleChange"
          placeholder="请选择合同"
          clearable
          filterable
          style="width: 292.2px"
        >
          <el-option
            v-for="contract in contracts"
            :key="contract.id"
            :label="contract.auditNo"
            :value="contract.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item
        label="甲方公司名称："
        label-width="133.45"
        prop="companyName"
      >
        <el-input
          v-model="insertForm.companyName"
          minlength="8"
          type="text"
          placeholder="请输入甲方公司名称"
          style="width: 292.2px"
        />
      </el-form-item>
      <el-form-item label="甲方联系人姓名：" prop="companyContactUserName">
        <el-input
          v-model="insertForm.companyContactUserName"
          minlength="2"
          type="text"
          placeholder="请输入甲方联系人姓名"
          style="width: 292.2px"
        />
      </el-form-item>
      <el-form-item label="甲方联系人电话：" prop="companyContactUserTel">
        <el-input
          v-model="insertForm.companyContactUserTel"
          minlength="11"
          type="text"
          placeholder="请输入甲方联系人电话"
          style="width: 292.2px"
        />
      </el-form-item>
      <el-form-item label="成交金额：" label-width="133.45" prop="amount">
        <el-input-number
          v-model="insertForm.amount"
          :precision="2"
          :step="0.1"
          :min="0"
          :value-on-clear="0"
          controls-position="right"
          style="width: 292.2px"
        />
      </el-form-item>
      <el-form-item label="备注：" label-width="133.45" prop="remark">
        <el-input
          v-model="insertForm.remark"
          :autosize="{ minRows: 2, maxRows: 4 }"
          minlength="1"
          type="textarea"
          placeholder="请输入备注"
          style="width: 500px"
        />
      </el-form-item>
      <el-form-item label="合同附件：" label-width="133.45" prop="annexUrlList">
        <ObsFileUpload
          v-model:modelValue="insertForm.annexUrlList"
          :limit="3"
          :fileSize="5"
          @filePreview="annexPreview"
          ref="obsFileUploadRef"
        />
      </el-form-item>
      <el-form-item
        label="打款截图："
        label-width="133.45"
        prop="paymentScreenshotList"
      >
        <ObsImgUpload
          v-model:modelValue="insertForm.paymentScreenshotList"
          :limit="3"
          :fileSize="5"
          @filePreview="annexPreview"
          ref="obsImgUploadRef"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="closeInsertForm">取消</el-button>
      <el-button type="primary" @click="submitForm(insertFormRef)"
        >保存</el-button
      >
    </template>
  </el-dialog>
</template>

<script setup>
import { save, pageQuery } from "@/api/core/businessOrder";
import { computed } from "vue";

var emit = defineEmits(["refresh", "update:visit", "filePreview"]);
const { proxy } = getCurrentInstance();
const props = defineProps({
  visit: {
    type: Boolean,
    required: true,
  },
  insertRules: {
    type: Object,
    required: true,
  },
});

const insertDialogVisibleFlag = computed({
  get: () => props.visit,
  set: (val) => emit("update:visit", val),
});
const insertRules = computed(() => props.insertRules);

const obsFileUploadRef = ref(null);
const obsImgUploadRef = ref(null);
var insertFormRef = ref(null);
var insertForm = ref({
  paymentTime: undefined,
  companyName: undefined,
  companyContactUserName: undefined,
  companyContactUserTel: undefined,
  amount: undefined,
  remark: undefined,
  annexUrlList: undefined,
  paymentScreenshotList: undefined,
  bizTypeList: undefined,
  contractId: undefined,
});

function annexPreview(file) {
  emit("filePreview", file);
}

function submitForm(form) {
  if (!form) {
    return;
  }
  form.validate((valid) => {
    var arr = insertForm.value.bizTypeList.filter((x) => x == "1" || x == "6");
    if (arr.length > 1) {
      proxy.$modal.msgError("代理记账和代理记账续期不能同时选择");
      return;
    }
    if (valid) {
      save(insertForm.value).then((response) => {
        proxy.$modal.msgSuccess("新增成功");
        emit("refresh");
      });
      closeInsertForm();
    }
  });
}

function closeInsertForm() {
  emit("update:visit", false);
  originalOrderShowFlag.value = false;
  contracts.value = [];
  obsFileUploadRef.value.clearAll();
  obsImgUploadRef.value.clearAll();
  proxy.resetForm("insertFormRef");
}

const originalOrderShowFlag = ref(false);
function handleBizTypeChange(arr) {
  if (arr.includes("6")) {
    originalOrderShowFlag.value = true;
    if (!contracts.value.length) {
      getOrderAgencyList();
    }
    return;
  }
  originalOrderShowFlag.value = false;
}

const contracts = ref([]);
const contractObj = {};
const getOrderAgencyList = async () => {
  const res = await pageQuery({
    pageSize: 9999,
    bizType: 1,
    approvalStatus: 1,
  });
  contracts.value = res.rows;
  contracts.value.forEach((item) => {
    contractObj[item.id] = item;
  });
};

function handleVisibleChange(orderId) {
  if (!orderId) {
    return;
  }
  const order = contractObj[orderId];
  if (!order) {
    return;
  }
  insertForm.value.contractId = order.id;
  insertForm.value.companyName = order.companyName;
  insertForm.value.companyContactUserName = order.companyContactUserName;
  insertForm.value.companyContactUserTel = order.companyContactUserTel;
}
</script>