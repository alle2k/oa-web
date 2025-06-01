<template>
  <div class="layout">
    <div style="display: flex; align-items: center">
      <h3>代理记账信息</h3>
    </div>
    <div class="line" />
    <div id="detail">
      <el-descriptions column="1" border="true">
        <el-descriptions-item
          label="合同编号："
          label-align="right"
          align="left"
        >
          <el-button type="primary" @click="toDetail(bizInfo.orderId)" link>{{
            bizInfo.orderAuditNo
          }}</el-button>
        </el-descriptions-item>
        <el-descriptions-item
          label="付款时间："
          label-align="right"
          align="left"
        >
          {{ parseTime(new Date(bizInfo.paymentTime)) }}
        </el-descriptions-item>
        <el-descriptions-item
          label="甲方公司名称："
          label-align="right"
          align="left"
        >
          <el-button
            v-if="
              checkPermi(['biz:order:sensitive', 'account:agency:sensitive'])
            "
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
            v-if="
              checkPermi(['biz:order:sensitive', 'account:agency:sensitive'])
            "
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
            v-if="
              checkPermi(['biz:order:sensitive', 'account:agency:sensitive'])
            "
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
        <el-descriptions-item
          label="合同金额："
          label-align="right"
          align="left"
        >
          {{ bizInfo.orderAmount }}
        </el-descriptions-item>
        <el-descriptions-item
          label="代理记账金额："
          label-align="right"
          align="left"
        >
          {{ bizInfo.amount }}
        </el-descriptions-item>
        <el-descriptions-item
          label="服务起止时间："
          label-align="right"
          align="left"
        >
          {{
            parseTime(new Date(bizInfo.serviceBeginDate), "{y}-{m}-{d}") +
            " ~ " +
            parseTime(new Date(bizInfo.serviceEndDate), "{y}-{m}-{d}")
          }}
        </el-descriptions-item>
      </el-descriptions>
    </div>
  </div>
</template>

<script setup>
import { parseTime } from "@/utils/oa";
import { checkPermi } from "@/utils/permission";

const props = defineProps({
  bizInfo: {
    type: Object,
    required: true,
  },
});
const bizInfo = computed(() => props.bizInfo);

const router = useRouter();
function toDetail(id) {
  router.push({
    path: `/approval/detail/1001/${id}`,
  });
}

const companyNameVisitFlag = ref(false);
const companyContactUserNameVisitFlag = ref(false);
const companyContactUserTelVisitFlag = ref(false);
const companyNameShow = computed(() => {
  if (!companyNameVisitFlag.value) {
    return hideCompanyName();
  }
  return bizInfo.value.companyName;
});
const companyContactUserNameShow = computed(() => {
  if (!companyContactUserNameVisitFlag.value) {
    return hideCompanyContactUserName();
  }
  return bizInfo.value.companyContactUserName;
});
const companyContactUserTelShow = computed(() => {
  if (!companyContactUserTelVisitFlag.value) {
    return hideCompanyContactUserTel();
  }
  return bizInfo.value.companyContactUserTel;
});
function hideCompanyName() {
  return (
    bizInfo.value.companyName?.substr(0, 2) +
    (function () {
      let str = "";
      let hideLength = bizInfo.value.companyName?.length - 4;
      for (let i = 0; i < hideLength; i++) {
        str += "*";
      }
      return str;
    })() +
    bizInfo.value.companyName?.substr(-2, 2)
  );
}
function hideCompanyContactUserName() {
  if (!bizInfo.value.companyContactUserName) {
    return "";
  }
  if (bizInfo.value.companyContactUserName?.length <= 3) {
    return (
      bizInfo.value.companyContactUserName?.substr(0, 1) +
      Array.prototype.map
        .call(bizInfo.value.companyContactUserName?.substr(1), () => "*")
        .join("")
    );
  }
  return (
    bizInfo.value.companyContactUserName?.substr(0, 2) +
    Array.prototype.map
      .call(bizInfo.value.companyContactUserName?.substr(2), () => "*")
      .join("")
  );
}
function hideCompanyContactUserTel() {
  if (!bizInfo.value.companyContactUserTel) {
    return "";
  }
  return (
    bizInfo.value.companyContactUserTel?.substr(0, 3) +
    "****" +
    bizInfo.value.companyContactUserTel?.substr(-4)
  );
}
</script>

<style scoped lang="scss">
.layout {
  background: #fff;
  padding: 10px 20px;
  margin-top: 15px;
  border-radius: 8px;

  .line {
    width: 100%;
    border-bottom: 1px dashed #e6e6e6;
    margin-bottom: 15px;
  }

  h3 {
    color: #515a6e;
    font-weight: bold;
  }

  #detail {
    :deep(.el-button) {
      padding: 0px 0px 0px 0px;
      font-size: 14px;
    }
    :deep(.el-descriptions__label) {
      width: 150px;
    }
  }
}
</style>