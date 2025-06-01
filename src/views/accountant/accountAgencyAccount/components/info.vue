<template>
  <div class="projectDetailInfo">
    <div class="accountTop">
      <VSmallTitle title="代理记账详情" />
      <el-button type="primary" plain @click="router.back()"
        >返&nbsp;&nbsp;回</el-button
      >
    </div>
    <div class="accountTitle">
      <div class="tag">
        <div class="projectInfo">
          <el-image :src="project" />
          <div>
            <div class="projectTag">
              <h2>{{ accountAgencyInfoData.contractNo }}</h2>
            </div>
          </div>
        </div>
        <el-tabs v-model="tagName" @tab-change="handleClick">
          <el-tab-pane label="代理记账基本信息" name="projectInfo" />
          <el-tab-pane label="代理记账续期记录" name="change" />
        </el-tabs>
      </div>
      <div class="total">
        <div>
          <p>¥{{ accountAgencyInfoData.orderAmount?.toFixed(2) }}</p>
          <span>合同总金额</span>
        </div>
        <div>
          <p>¥{{ accountAgencyInfoData.amount?.toFixed(2) }}</p>
          <span>代理记账金额</span>
        </div>
      </div>
    </div>
    <div :class="tagName != 'change' ? 'accountContent' : ''">
      <keep-alive>
        <component :is="componentActive" :data="accountAgencyInfoData" />
      </keep-alive>
    </div>
  </div>
</template>

<script setup>
import VSmallTitle from "@/components/vSmallTitle/index.vue";
import project from "@/assets/icons/svg/project.svg";
import { detail } from "@/api/core/accountAgencyAccount";
import projectInfo from "./basicInfo.vue";
import change from "./change.vue";

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
});

const tagName = ref("projectInfo");
const componentActive = ref(projectInfo);
const componentMap = reactive({
  projectInfo: projectInfo,
  change: change,
});
const router = useRouter();
const accountAgencyInfoData = reactive({
  createUser: undefined,
  createUserName: undefined,
  createUserDeptId: undefined,
  createUserDeptName: undefined,
  createUserFullDeptId: undefined,
  createUserFullDeptName: undefined,
  id: undefined,
  orderId: undefined,
  contractNo: undefined,
  amount: undefined,
  serviceBeginDate: undefined,
  serviceEndDate: undefined,
  createTime: undefined,
  paymentTime: undefined,
  companyName: undefined,
  companyContactUserName: undefined,
  companyContactUserTel: undefined,
  orderAmount: undefined,
  usedAmount: undefined,
  freeAmount: undefined,
  annexUrlList: undefined,
  paymentScreenshotList: undefined,
});

onMounted(() => {
  detail(props.id).then((res) => {
    for (let item in accountAgencyInfoData) {
      accountAgencyInfoData[item] = res.data[item];
    }
  });
});

const handleClick = (val) => {
  componentActive.value = componentMap[val];
};
</script>

<style scoped lang="scss">
.projectDetailInfo {
  background: #f6f8f9;
  > div {
    margin-bottom: 20px;
    background: #fff;
  }
  :deep(.el-tabs__nav-wrap:after) {
    display: none;
  }
  :deep(.el-tabs__header) {
    margin-bottom: 0;
  }
  .accountTop {
    align-items: center;
    display: flex;
    justify-content: space-between;
    padding: 8px 15px;
    .v-small-title {
      margin-bottom: 0;
    }
  }
  .accountTitle {
    padding: 20px 15px 0 15px;
    display: flex;
    justify-content: space-between;
    .projectInfo {
      margin-bottom: 40px;
      display: flex;
      justify-content: start;
      align-items: center;
      h2 {
        margin: 0;
        //margin: 0 0 8px 0;
      }
      .el-image {
        width: 60px;
        height: 60px;
        margin-right: 10px;
      }
      .projectTag {
        display: flex;
        justify-content: start;
        align-items: center;
        margin-bottom: 12px;
        span {
          padding: 5px 20px;
          color: #ffffff;
          font-weight: bold;
          border-radius: 50px;
          margin-left: 15px;
        }

        h2 {
          color: #515a6e;
          font-weight: bold;
        }
      }
    }
    > div {
      width: 50%;
    }
    .total {
      p {
        margin: 0 0 15px 0;
        font-weight: bold;
        font-size: 22px;
      }
      > div {
        margin-right: 50px;
      }
      color: #515a6e;
      display: flex;
      padding: 0 20px;
      justify-content: end;
      align-items: center;
      text-align: center;
    }
  }
  .accountContent {
    padding: 20px;
  }
}
</style>