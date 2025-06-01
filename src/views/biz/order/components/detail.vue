<template>
  <div class="orderLayout">
    <div style="display: flex; align-items: center">
      <h3>合同基本信息</h3>
    </div>
    <div class="line" />
    <div id="detail">
      <el-descriptions column="1" border="true">
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
            v-if="checkPermi(['biz:order:sensitive'])"
            type="primary"
            size="small"
            @click="companyNameVisitFlag = !companyNameVisitFlag"
            text
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
            v-if="checkPermi(['biz:order:sensitive'])"
            type="primary"
            size="small"
            @click="
              companyContactUserNameVisitFlag = !companyContactUserNameVisitFlag
            "
            text
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
            v-if="checkPermi(['biz:order:sensitive'])"
            type="primary"
            size="small"
            @click="
              companyContactUserTelVisitFlag = !companyContactUserTelVisitFlag
            "
            text
          >
            {{ companyContactUserTelShow }}
          </el-button>
          <span v-else>{{ companyContactUserTelShow }}</span>
        </el-descriptions-item>
        <el-descriptions-item
          label="业务类型："
          label-align="right"
          align="left"
        >
          {{ bizType }}
        </el-descriptions-item>
        <el-descriptions-item
          label="关联合同："
          label-align="right"
          align="left"
          v-if="contractNo"
        >
          <el-button type="primary" size="small" text @click="orderClick">
            {{ contractNo }}
          </el-button>
        </el-descriptions-item>
        <el-descriptions-item
          label="成交金额："
          label-align="right"
          align="left"
        >
          {{ bizInfo.amount }}
        </el-descriptions-item>
        <el-descriptions-item label="业绩：" label-align="right" align="left">
          <span>{{ bizInfo.performance }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="备注：" label-align="right" align="left">
          <el-popover
            effect="light"
            trigger="hover"
            placement="top"
            width="auto"
          >
            <template #default>
              {{ bizInfo.remark }}
            </template>
            <template #reference>
              <div
                style="
                  display: -webkit-box;
                  -webkit-box-orient: vertical;
                  -webkit-line-clamp: 2;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: pre-line;
                "
              >
                {{ bizInfo.remark }}
              </div>
            </template>
          </el-popover>
        </el-descriptions-item>
      </el-descriptions>
      <div>
        <span class="subtitle">合同附件</span>
        <fileTable :list="bizInfo.annexUrlList"/>
      </div>
      <div>
        <span class="subtitle">打款截图</span>
        <fileTable :list="bizInfo.paymentScreenshotList"/>
      </div>
    </div>
  </div>
</template>

<script setup>
import { parseTime } from "@/utils/oa";
import { checkPermi } from "@/utils/permission";
import fileTable from '@/components/ApprovalFlow2/fileTable.vue';

const props = defineProps({
  bizInfo: {
    type: Object,
    required: true,
  },
});
const bizInfo = computed(() => props.bizInfo);

const bizType = computed(() => {
  return bizInfo.value.itemList
    ?.map((x) => {
      return x.bizTypeName;
    })
    .join(", ");
});

const contractNo = computed(() => {
  if (!bizInfo.value.refOrderList.length) {
    return null;
  }
  return bizInfo.value.refOrderList[0]?.auditNo;
});

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

const router = useRouter();
function orderClick() {
  router.push({
    path: `/approval/detail/1001/${bizInfo.value.refOrderList[0]?.id}`,
  });
}
</script>

<style scoped lang="scss">
.orderLayout {
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

    .subtitle {
      border-left: 3px solid #515a6e;
      padding-left: 5px;
      display: block;
      font-weight: bold;
      margin: 22px 0;
      color: #515a6e;
    }
  }
}
</style>