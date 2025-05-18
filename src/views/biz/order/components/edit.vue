<template>
  <el-drawer v-model="editDrawer" title="重新提交" direction="rtl">
    <el-form
      :model="modifyForm"
      style="margin-top: 20px"
      :rules="insertRules"
      ref="modifyFormRef"
    >
      <el-form-item label="付款时间：" label-width="135" prop="paymentTime">
        <el-date-picker
          v-model="modifyForm.paymentTime"
          type="datetime"
          placeholder="请选择付款时间"
          value-format="yyyy-MM-dd HH:mm:ss"
          style="width: 292.2px"
        />
      </el-form-item>
      <el-form-item label="业务类型：" label-width="135" prop="bizTypeList">
        <el-select
          v-model="modifyForm.bizTypeList"
          placeholder="请选择业务类型"
          style="width: 292.2px"
          multiple
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
          v-model="modifyForm.contractId"
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
      <el-form-item label="甲方公司名称：" label-width="135" prop="companyName">
        <el-input
          v-model="modifyForm.companyName"
          minlength="8"
          type="text"
          placeholder="请输入甲方公司名称"
          style="width: 292.2px"
        />
      </el-form-item>
      <el-form-item
        label="甲方联系人姓名："
        label-width="135"
        prop="companyContactUserName"
      >
        <el-input
          v-model="modifyForm.companyContactUserName"
          minlength="2"
          type="text"
          placeholder="请输入甲方联系人姓名"
          style="width: 292.2px"
        />
      </el-form-item>
      <el-form-item
        label="甲方联系人电话："
        label-width="135"
        prop="companyContactUserTel"
      >
        <el-input
          v-model="modifyForm.companyContactUserTel"
          minlength="11"
          type="text"
          placeholder="请输入甲方联系人电话"
          style="width: 292.2px"
        />
      </el-form-item>
      <el-form-item label="成交金额：" label-width="135" prop="amount">
        <el-input-number
          v-model="modifyForm.amount"
          :precision="2"
          :step="0.1"
          :min="0"
          value-on-clear="min"
          controls-position="right"
          style="width: 292.2px"
        />
      </el-form-item>
      <el-form-item label="备注：" label-width="135" prop="remark">
        <el-input
          v-model="modifyForm.remark"
          :autosize="{ minRows: 2, maxRows: 4 }"
          minlength="1"
          type="textarea"
          placeholder="请输入备注"
          style="width: 292.2px"
        />
      </el-form-item>
      <el-form-item label="合同附件：" label-width="135" prop="annexUrlList">
        <ObsFileUpload
          v-model:modelValue="modifyForm.annexUrlList"
          :limit="3"
          :fileSize="5"
          @filePreview="annexPreview"
          ref="obsFileUploadRef"
        />
      </el-form-item>
      <el-form-item
        label="打款截图："
        label-width="135"
        prop="paymentScreenshotList"
      >
        <ObsImgUpload
          v-model:modelValue="modifyForm.paymentScreenshotList"
          :limit="3"
          :fileSize="5"
          @filePreview="annexPreview"
          ref="obsImgUploadRef"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="closeModifyForm">取消</el-button>
      <el-button type="primary" @click="submitModifyForm(modifyFormRef)"
        >保存</el-button
      >
    </template>
  </el-drawer>
</template>

<script setup>
import { parseTime } from "@/utils/oa";
import { pageQuery, save, modify } from "@/api/core/businessOrder";

const props = defineProps({
  insertRules: {
    type: Object,
    required: true,
  },
  visit: {
    type: Boolean,
    required: true,
  },
});
var emit = defineEmits(["refresh", "update:visit", "filePreview"]);

const editDrawer = computed({
  get: () => props.visit,
  set: (val) => emit("update:visit", val),
});
const insertRules = computed(() => props.insertRules);

const { proxy } = getCurrentInstance();

const obsFileUploadRef = ref(null);
const obsImgUploadRef = ref(null);
var modifyFormRef = ref(null);
var modifyForm = ref({});
function openEditDrawer() {
  modifyForm.value = JSON.parse(JSON.stringify(arguments[0]));
  if (modifyForm.value.renewOrderId) {
    originalOrderShowFlag.value = true;
  }
  modifyForm.value.bizTypeList = modifyForm.value.itemList.map((x) => {
    return { label: x.bizTypeName, value: x.bizType };
  });
  modifyForm.value.paymentTime = parseTime(
    new Date(modifyForm.value.paymentTime)
  );
  modifyForm.value.annexUrlList = modifyForm.value.annexUrlList.map((x) => {
    var obj = {};
    obj.name = x.substr(x.lastIndexOf("/") + 1);
    obj.url = x;
    obj.response = {
      data: x,
    };
    return obj;
  });
  modifyForm.value.paymentScreenshotList =
    modifyForm.value.paymentScreenshotList.map((x) => {
      var obj = {};
      obj.name = x.substr(x.lastIndexOf("/") + 1);
      obj.url = x;
      obj.response = {
        data: x,
      };
      return obj;
    });
}

function submitModifyForm(form) {
  if (!form) {
    return;
  }
  form.validate((valid) => {
    if (valid) {
      var arr = modifyForm.value.bizTypeList.filter(
        (x) => x == "1" || x == "6"
      );
      if (arr.length > 1) {
        proxy.$modal.msgError("代理记账和代理记账续期不能同时选择");
        return;
      }
      if (typeof modifyForm.value.annexUrlList[0] === "object") {
        modifyForm.value.annexUrlList = modifyForm.value.annexUrlList.map(
          (x) => {
            return x.response.data;
          }
        );
      }
      if (typeof modifyForm.value.paymentScreenshotList[0] === "object") {
        modifyForm.value.paymentScreenshotList =
          modifyForm.value.paymentScreenshotList.map((x) => {
            return x.response.data;
          });
      }
      var method = modify;
      if (
        modifyForm.value.approvalStatus === 2 ||
        modifyForm.value.approvalStatus === 4
      ) {
        method = save;
      }
      modifyForm.value.bizTypeList = modifyForm.value.bizTypeList.map((x) => {
        return x.value;
      });
      method(modifyForm.value).then((response) => {
        proxy.$modal.msgSuccess("修改成功");
        emit("refresh");
      });
      closeModifyForm();
    }
  });
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
  modifyForm.value.contractId = order.id;
  modifyForm.value.companyName = order.companyName;
  modifyForm.value.companyContactUserName = order.companyContactUserName;
  modifyForm.value.companyContactUserTel = order.companyContactUserTel;
}

function closeModifyForm() {
  emit("update:visit", false);
  originalOrderShowFlag.value = false;
  obsFileUploadRef.value.clearAll();
  obsImgUploadRef.value.clearAll();
  proxy.resetForm("modifyFormRef");
}

function annexPreview(file) {
  emit("filePreview", file);
}

defineExpose({
  openEditDrawer,
  closeModifyForm,
});
</script>