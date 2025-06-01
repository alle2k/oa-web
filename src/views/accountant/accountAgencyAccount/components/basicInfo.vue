<template>
  <div class="projectInfo">
    <el-descriptions column="2" border="true">
      <el-descriptions-item label="付款时间：" label-align="right" align="left">
        {{ data.paymentTime ? parseTime(new Date(data.paymentTime)) : "" }}
      </el-descriptions-item>
      <el-descriptions-item
        label="甲方公司名称："
        label-align="right"
        align="left"
      >
        <el-button
          v-if="checkPermi(['account:agency:sensitive'])"
          type="primary"
          @click="companyNameVisitFlag = !companyNameVisitFlag"
          link
          >{{ companyNameShow }}</el-button
        >
        <span v-else>{{ companyNameShow }}</span>
      </el-descriptions-item>
      <el-descriptions-item
        label="甲方联系人姓名："
        label-align="right"
        align="left"
      >
        <el-button
          v-if="checkPermi(['account:agency:sensitive'])"
          type="primary"
          @click="
            companyContactUserNameVisitFlag = !companyContactUserNameVisitFlag
          "
          link
          >{{ companyContactUserNameShow }}</el-button
        >
        <span v-else>{{ companyContactUserNameShow }}</span>
      </el-descriptions-item>
      <el-descriptions-item
        label="甲方联系人电话："
        label-align="right"
        align="left"
      >
        <el-button
          v-if="checkPermi(['account:agency:sensitive'])"
          type="primary"
          @click="
            companyContactUserTelVisitFlag = !companyContactUserTelVisitFlag
          "
          link
        >
          {{ companyContactUserTelShow }}
        </el-button>
        <span v-else>{{ companyContactUserTelShow }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="合同金额：" label-align="right" align="left">
        {{ data.orderAmount }}
      </el-descriptions-item>
      <el-descriptions-item
        label="代理记账金额："
        label-align="right"
        align="left"
      >
        {{ data.amount }}
      </el-descriptions-item>
      <el-descriptions-item
        label="服务开始时间："
        label-align="right"
        align="left"
      >
        {{
          data.serviceBeginDate
            ? parseTime(new Date(data.serviceBeginDate), "{y}-{m}-{d}")
            : ""
        }}
      </el-descriptions-item>
      <el-descriptions-item
        label="服务结束时间："
        label-align="right"
        align="left"
      >
        {{
          data.serviceEndDate
            ? parseTime(new Date(data.serviceEndDate), "{y}-{m}-{d}")
            : ""
        }}
      </el-descriptions-item>
    </el-descriptions>
    <div class="projectFile">
      <span class="subtitle">合同附件</span>
      <fileTable :list="data.annexUrlList" />
    </div>
    <div>
      <span class="subtitle">打款截图</span>
      <fileTable :list="data.paymentScreenshotList" />
    </div>
  </div>
</template>

<script setup>
import { parseTime } from "@/utils/oa";
import { checkPermi } from "@/utils/permission";
import fileTable from "@/components/ApprovalFlow2/fileTable.vue";

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
});

const data = computed(() => props.data);

const companyNameVisitFlag = ref(false);
const companyContactUserNameVisitFlag = ref(false);
const companyContactUserTelVisitFlag = ref(false);
const companyNameShow = computed(() => {
  if (!companyNameVisitFlag.value) {
    return hideCompanyName();
  }
  return data.value.companyName;
});
const companyContactUserNameShow = computed(() => {
  if (!companyContactUserNameVisitFlag.value) {
    return hideCompanyContactUserName();
  }
  return data.value.companyContactUserName;
});
const companyContactUserTelShow = computed(() => {
  if (!companyContactUserTelVisitFlag.value) {
    return hideCompanyContactUserTel();
  }
  return data.value.companyContactUserTel;
});
function hideCompanyName() {
  return (
    data.value.companyName?.substr(0, 2) +
    (function () {
      let str = "";
      let hideLength = data.value.companyName?.length - 4;
      for (let i = 0; i < hideLength; i++) {
        str += "*";
      }
      return str;
    })() +
    data.value.companyName?.substr(-2, 2)
  );
}
function hideCompanyContactUserName() {
  if (!data.value.companyContactUserName) {
    return "";
  }
  if (data.value.companyContactUserName?.length <= 3) {
    return (
      data.value.companyContactUserName?.substr(0, 1) +
      Array.prototype.map
        .call(data.value.companyContactUserName?.substr(1), () => "*")
        .join("")
    );
  }
  return (
    data.value.companyContactUserName?.substr(0, 2) +
    Array.prototype.map
      .call(data.value.companyContactUserName?.substr(2), () => "*")
      .join("")
  );
}
function hideCompanyContactUserTel() {
  if (!data.value.companyContactUserTel) {
    return "";
  }
  return (
    data.value.companyContactUserTel?.substr(0, 3) +
    "****" +
    data.value.companyContactUserTel?.substr(-4)
  );
}
</script>

<style lang="scss" scoped>
.projectInfo {
  :deep(.el-descriptions__label) {
    width: 165px !important;
    background: #f4f3f4 !important;
  }
  :deep(.el-descriptions__content) {
    width: 350px !important;
  }
  :deep(.el-descriptions__cell) {
    line-height: 38px !important;
  }
  .projectFile {
    :deep(.el-table__header) {
      display: none;
    }
  }
  .subtitle {
    color: #515a6e;
    border-left: 3px solid #515a6e;
    padding-left: 5px;
    display: block;
    font-weight: bold;
    margin: 22px 0;
  }
}
</style>