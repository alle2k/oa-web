<template>
  <div v-if="!loading" />
  <div class="applyDetails" v-else>
    <el-affix :offset="0">
      <header>
        <div>
          <el-button
            plain
            type="primary"
            @click="proxy.$modal.notifySuccess('火速开发中，敬请期待')"
          >
            下一条
          </el-button>
          <el-button plain type="primary" @click="router.back()">
            返回列表
          </el-button>
        </div>
      </header>
    </el-affix>
    <el-affix style="height: 0" :offset="211">
      <el-anchor @click="handleClick">
        <div class="link">
          <template v-for="item in anchorList" :key="item.id">
            <el-anchor-link :href="item.id">
              <el-button plain type="primary">{{ item.name }}</el-button>
            </el-anchor-link>
          </template>
        </div>
      </el-anchor>
    </el-affix>
    <div class="applyContent">
      <div class="basicInfo" id="basicInfo">
        <div>
          <el-image
            v-if="applyImgMap[basicInfo.bizInfo.approvalStatus]"
            class="applyImg"
            :src="applyImgMap[basicInfo.bizInfo.approvalStatus]"
          />
        </div>
        <span>审批编号：{{ basicInfo.bizInfo.auditNo }}</span>
        <h2>{{ basicInfo.title }}</h2>
        <div style="display: flex; justify-content: space-between">
          <span>
            所在部门：{{
              (basicInfo.bizInfo.createUserFullDeptName
                ? basicInfo.bizInfo.createUserFullDeptName + ">"
                : "") + basicInfo.bizInfo.createUserName
            }}
          </span>
        </div>
      </div>
      <component :is="approvalMap[auditType]" :bizInfo="basicInfo.bizInfo" />
      <div class="flow" v-if="basicInfo.nodeInfo.length">
        <h3 id="flow">审批流程</h3>
        <approvalFlow :node-info="basicInfo.nodeInfo" />
      </div>
    </div>
    <el-affix
      v-hasPermi="['approval']"
      v-if="basicInfo.bizInfo.approvalStatus === 0 && flag !== '0'"
      position="bottom"
    >
      <footer>
        <div v-if="basicInfo.bizInfo.createUser === userStore.id">
          <el-button
            style="border-radius: 50px"
            plain
            type="primary"
            @click="proxy.$modal.notifySuccess('火速开发中，敬请期待')"
          >
            催办
          </el-button>
          <el-button
            style="border-radius: 50px"
            plain
            type="primary"
            @click="applyReturn"
          >
            撤销
          </el-button>
        </div>
        <div
          v-if="
            basicInfo.currentAuditUserList?.map(x => x.id)?.includes(userStore.id) ||
            userStore.permissions?.includes('*:*:*')
          "
          style="display: flex"
        >
          <el-button
            style="border-radius: 50px"
            plain
            type="primary"
            @click="proxy.$modal.notifySuccess('火速开发中，敬请期待')"
          >
            转审
          </el-button>
          <el-button
            style="border-radius: 50px"
            plain
            type="primary"
            @click="auditDialogShow('goBack')"
          >
            退回
          </el-button>
          <div style="margin-left: 12px">
            <el-button
              style="border-right: none; border-radius: 50px 0 0 50px"
              plain
              type="primary"
              @click="auditDialogShow('reject')"
            >
              拒绝
            </el-button>
            <el-button
              style="margin-left: 0; border-radius: 0 50px 50px 0"
              type="primary"
              @click="auditDialogShow('agree')"
            >
              同意
            </el-button>
          </div>
        </div>
      </footer>
    </el-affix>
  </div>

  <el-dialog
    v-model="auditDialogVisibleFlag"
    title="审批"
    @open="openAuditFormDialog"
    @close="closeAuditFormDialog"
  >
    <el-form :model="auditForm" :rules="auditRules" ref="auditFormRef">
      <template v-if="specialFormFields">
        <el-form-item
          v-for="(field, key) in specialFormFields"
          :key="key"
          :label="field.label + '：'"
          :prop="key"
          label-width="100"
        >
          <el-input-number
            v-if="field.type === 'number'"
            v-model="auditForm[key]"
            :precision="field.precision"
            :step="field.step"
            :min="field.min"
            :controls-position="field.controlsPosition"
          />
          <el-input
            v-else-if="field.type === 'text'"
            v-model="auditForm[key]"
            :placeholder="'请输入' + field.label"
          />
          <el-input
            v-else-if="field.type === 'textarea'"
            v-model="auditForm[key]"
            type="textarea"
            :placeholder="'请输入' + field.label"
          />
        </el-form-item>
      </template>
      <el-form-item label="审批意见：" prop="remark" label-width="100">
        <el-input
          v-model="auditForm.remark"
          :autosize="{ minRows: 2, maxRows: 4 }"
          minlength="1"
          type="textarea"
          placeholder="请输入审批意见"
          style="width: 500px"
        />
      </el-form-item>
      <el-form-item label="附件：" prop="annexUrlList" label-width="100">
        <ObsFileUpload
          v-model:modelValue="auditForm.annexUrlList"
          :limit="3"
          :fileSize="5"
          @filePreview="annexPreview"
          ref="obsFileUploadRef"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="closeAuditFormDialog">取消</el-button>
      <el-button type="primary" @click="submitAuditForm(auditFormRef)"
        >保存</el-button
      >
    </template>
  </el-dialog>

  <el-dialog v-model="dialogVisible" title="预览" width="800px" append-to-body>
    <img
      :src="dialogImageUrl"
      style="display: block; max-width: 100%; margin: 0 auto"
    />
  </el-dialog>

  <el-dialog v-model="pdfDialogVisible" width="1000px">
    <div ref="pdfContainer"></div>
  </el-dialog>
</template>

<script setup>
import adoptPng from "@/assets/images/adopt.png";
import waitPng from "@/assets/images/wait.png";
import refusePng from "@/assets/images/refuse.png";
import revokePng from "@/assets/images/revoke.png";
import returnPng from "@/assets/images/return.png";
import approvalFlow from "@/components/ApprovalFlow2/index.vue";
import orderDetail from "@/views/biz/order/components/detail.vue";
import accountAgencyDetail from "@/views/accountant/accountAgency/components/detail.vue";
import useUserStore from "@/store/modules/user";
import { specialApprovalForm } from "@/utils/oa";
import { audit, rollback } from "@/api/core/flowable";
import pdfObj from "pdfobject";
import { getBizDetailByBizIdAndAuditType } from "@/api/core/approvalSubmissionRecord";

const { proxy } = getCurrentInstance();
const userStore = useUserStore();
const props = defineProps({
  bizId: {
    type: Number,
    required: true,
  },
  auditType: {
    type: Number,
    required: true,
  },
});
const auditType = computed(() => {
  return props.auditType;
});

const route = useRoute();
const flag = computed(() => {
  return route.query.flag;
});

const router = useRouter();

const approvalMap = reactive({
  1001: orderDetail,
  1002: accountAgencyDetail,
});

const applyImgMap = reactive({
  1: adoptPng,
  0: waitPng,
  2: refusePng,
  4: revokePng,
  5: returnPng,
});

const basicInfo = reactive({
  title: "提交订单申请",
  deptId: null,
  deptName: null,
  bizInfo: {},
  currentAuditUserList: null,
  nodeInfo: null,
});

const anchorList = reactive([
  {
    id: "basicInfo",
    name: "基本信息",
  },
  {
    id: "flow",
    name: "审批流程",
  },
]);

function handleClick(e, href) {
  const ele = document.getElementById(href);
  ele && ele.scrollIntoView({ block: "center", behavior: "smooth" });
  e.preventDefault();
}

const auditOperate = ref(null);
const auditFormRef = ref(null);
const auditDialogVisibleFlag = ref(false);
const specialFormFields = ref(null);
const auditForm = ref({
  remark: "",
  annexUrlList: [],
});
const defaultAuditRules = {
  remark: [
    {
      required: false,
      max: 500,
      message: "内容长度不能超过500",
      trigger: "blur",
    },
  ],
};
const auditRules = ref({
  remark: [
    {
      required: false,
      max: 500,
      message: "内容长度不能超过500",
      trigger: "blur",
    },
  ],
});

function auditDialogShow(operate) {
  auditDialogVisibleFlag.value = true;
  auditOperate.value = operate;
}

function openAuditFormDialog() {
  var defaultAuditRulesBak = JSON.parse(JSON.stringify(defaultAuditRules));
  if (auditOperate.value !== "agree") {
    defaultAuditRulesBak.remark[0].required = true;
    auditRules.value = {
      ...defaultAuditRulesBak,
    };
    return;
  }

  var taskId = basicInfo.nodeInfo[basicInfo.nodeInfo.length - 1].taskKey;
  // 获取特殊表单字段配置
  const formConfig = specialApprovalForm();
  if (formConfig[taskId]) {
    specialFormFields.value = formConfig[taskId];

    // 初始化表单值和校验规则
    const rules = {};
    Object.keys(formConfig[taskId]).forEach((key) => {
      const field = formConfig[taskId][key];
      auditForm.value[key] = field.type === "number" ? 0 : "";

      if (field.required) {
        rules[key] = [
          {
            required: true,
            message: `请输入${field.label}`,
            trigger: "blur",
            type: field.type === "number" ? "number" : "string",
          },
        ];
      }
    });

    // 合并校验规则
    auditRules.value = {
      ...defaultAuditRulesBak,
      ...rules,
    };
  } else {
    specialFormFields.value = null;
  }
}

const obsFileUploadRef = ref(null);
function closeAuditFormDialog() {
  auditDialogVisibleFlag.value = false;
  specialFormFields.value = null;
  auditOperate.value = null;
  auditForm.value = {
    remark: "",
    annexUrlList: [],
  };
  obsFileUploadRef.value.clearAll();
  proxy.resetForm("auditFormRef");
}

function submitAuditForm(form) {
  if (!form) {
    return;
  }
  form.validate((valid) => {
    if (valid) {
      var data = {};
      data.id = props.bizId;
      data.auditType = props.auditType;
      data.comment = {
        remark: auditForm.value.remark,
        annexUrl: auditForm.value.annexUrlList,
      };
      // 处理动态表单字段
      if (specialFormFields.value) {
        const extraData = {};
        Object.keys(specialFormFields.value).forEach((key) => {
          if (key in auditForm.value) {
            extraData[key] = auditForm.value[key];
          }
        });
        if (Object.keys(extraData).length > 0) {
          data.extra = JSON.stringify(extraData);
        }
      }
      if (auditOperate.value === "agree" || auditOperate.value === "reject") {
        data.auditAction = auditOperate.value;
        audit(data).then((response) => {
          proxy.$modal.msgSuccess("操作成功");
          getDetail();
        });
      } else {
        data.operateType = 0;
        rollback(data).then((response) => {
          proxy.$modal.msgSuccess("操作成功");
          getDetail();
        });
      }
      closeAuditFormDialog();
    }
  });
}

const pdfDialogVisible = ref(false);
const pdfContainer = ref(null);
const dialogImageUrl = ref("");
const dialogVisible = ref(false);
const annexPreview = async (arg) => {
  var fileUrl = "";
  if (typeof arg === "string") {
    fileUrl = arg;
  } else if ("response" in arg && typeof arg["response"] === "object") {
    fileUrl = arg.response?.data;
  }
  if (fileUrl.lastIndexOf(".pdf") > 0) {
    const response = await fetch(fileUrl);
    const blob = await response.blob();
    const pdfUrl = URL.createObjectURL(blob);
    pdfDialogVisible.value = true;
    nextTick(() => {
      pdfObj.embed(pdfUrl, pdfContainer.value, {
        width: "100%",
        height: "800px",
      });
    });
    return;
  }
  dialogImageUrl.value = fileUrl;
  dialogVisible.value = true;
};

const loading = ref(false);
const auditTitleObj = {
  1001: "提交订单申请",
  1002: "代理记账申请",
};
onMounted(() => {
  getDetail().then((x) => (loading.value = true));
});
function getDetail() {
  return getBizDetailByBizIdAndAuditType({
    bizId: props.bizId,
    auditType: props.auditType,
  }).then((x) => {
    basicInfo.bizInfo = x.data.bizInfo;
    basicInfo.currentAuditUserList = x.data.currentAuditUserList;
    basicInfo.nodeInfo = x.data.nodeInfo;
    basicInfo.title = auditTitleObj[props.auditType];
  });
}

function applyReturn() {
  proxy.$modal.confirm("确定撤销申请吗？").then(() => {
    var data = {
      id: props.bizId,
      operateType: 1,
      auditType: props.auditType,
    };
    rollback(data).then((response) => {
      proxy.$modal.msgSuccess("撤销成功");
      getDetail();
    });
  });
}
</script>

<style scoped lang="scss">
.applyDetails {
  background: #f6f8f9;

  .applyImg {
    width: 110px;
    height: 110px;
    position: absolute;
    bottom: 0;
    right: 20px;
  }

  .applyContent {
    display: flex;
    flex-direction: column;
    width: 65%;
    margin: 0 auto;
    padding-bottom: 50px;

    .basicInfo {
      position: relative;

      span {
        font-size: 12px;
        color: #999999;
        font-family: "PingFangSC-Regular", "PingFang SC", sans-serif;
      }

      h2 {
        color: #515a6e;
        font-weight: bold;
      }
    }

    .comment,
    .flow,
    .basicInfo {
      background: #ffffff;
      padding: 10px 20px;
      margin-top: 15px;
      border-radius: 8px;
    }

    h3 {
      color: #515a6e;
      font-weight: bold;
    }
  }

  :deep(.el-anchor) {
    background: none;
  }

  :deep(.el-anchor__marker) {
    display: none;
  }

  :deep(.el-anchor__list) {
    height: 0;
  }

  .link {
    display: flex;
    flex-direction: column;
    width: 150px;
    flex-wrap: wrap;
    padding-top: 90px;
    margin-left: 2%;

    :deep(.el-button) {
      width: 150px;
      border-radius: 0 50px 50px 0;
      margin-left: 0;
      margin-bottom: 15px;
    }
  }

  header {
    display: flex;
    justify-content: flex-end;
    padding: 6px 60px;
    background: #ffffff;
  }

  footer {
    background: #ffffff;
    padding: 10px 250px;
    display: flex;
    justify-content: end;

    :deep(.el-button) {
      width: 70px;
    }
  }
}
</style>