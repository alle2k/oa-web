<template>
  <div class="app-container">
    <el-form
      v-show="showSearch"
      :inline="true"
      :model="queryForm"
      label-width="68px"
      label-position="left"
      ref="queryFormRef"
    >
      <el-form-item label="审批编号" prop="auditNo">
        <el-input
          placeholder="请输入审批编号"
          style="width: 240px"
          clearable
          v-model="queryForm.auditNo"
        />
      </el-form-item>
      <el-form-item label="提交人" prop="createUser">
        <UserSelect v-model:userSelectModel="queryForm.createUser" />
      </el-form-item>
      <el-form-item label="审批状态" prop="approvalStatus">
        <ApprovalStatusSelect v-model:modelValue="queryForm.approvalStatus" />
      </el-form-item>
      <el-form-item label="公司名称" prop="companyName">
        <el-input
          placeholder="请输入公司名称"
          style="width: 240px"
          clearable
          v-model="queryForm.companyName"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="getList"
          >查询</el-button
        >
        <el-button type="Refresh" icon="RefreshRight" @click="resetQueryArea"
          >重置</el-button
        >
      </el-form-item>
    </el-form>
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5" v-if="checkPermi(['biz:order:sensitive'])">
        <el-button type="success" plain :icon="visitIcon" @click="visitHandle">
          {{ visitText }}
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="insertDialogVisibleFlag = true"
          >新增</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" @click="del"
          >删除</el-button
        >
      </el-col>
      <RightToolbar v-model:showSearch="showSearch" @queryTable="getList" />
    </el-row>

    <el-table stripe v-loading="loading" :data="orderList" ref="tableRef">
      <el-table-column
        type="selection"
        width="55"
        align="center"
        :selectable="allowEdit"
      />
      <el-table-column fixed label="审批编号" prop="auditNo" width="150" />
      <el-table-column label="甲方公司名称" prop="companyNameShow" width="210">
        <template #default="scope">
          <el-button
            v-if="checkPermi(['biz:order:sensitive'])"
            type="primary"
            text
            style="padding-left: 0px"
            @click="viewCompanyName(scope.row)"
            >{{ scope.row.companyNameShow }}</el-button
          >
          <span v-else>{{ scope.row.companyNameShow }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="甲方联系人姓名"
        prop="companyContactUserName"
        width="130"
      >
        <template #default="scope">
          <el-button
            type="primary"
            v-if="checkPermi(['biz:order:sensitive'])"
            @click="viewCompanyContactUserName(scope.row)"
            text
            style="padding-left: 0px"
            >{{ scope.row.companyContactUserNameShow }}</el-button
          >
          <span v-else>{{ scope.row.companyContactUserNameShow }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="甲方联系人电话"
        prop="companyContactUserTel"
        width="180"
      >
        <template #default="scope">
          <el-button
            v-if="checkPermi(['biz:order:sensitive'])"
            type="primary"
            text
            style="padding-left: 0px"
            @click="viewCompanyContactUserTel(scope.row)"
            >{{ scope.row.companyContactUserTelShow }}</el-button
          >
          <span v-else>{{ scope.row.companyContactUserTelShow }}</span>
        </template>
      </el-table-column>
      <el-table-column label="业务类型" prop="bizTypeList" width="150">
        <template #default="scope">
          <el-tooltip :content="scope.row.bizTypeList">
            <span
              style="
                display: inline-block;
                width: 100px;
                white-space: nowrap;
                overflow: hidden; /* 隐藏溢出的文本 */
                text-overflow: ellipsis; /* 显示省略号 */
              "
              >{{ scope.row.bizTypeList }}</span
            >
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="成交金额" prop="amount" width="150" />
      <el-table-column label="业绩" prop="performance" width="150" />
      <el-table-column label="提交人" prop="createUserName" width="150" />
      <el-table-column label="审批状态" prop="approvalStatus" width="100">
        <template #default="scope">
          {{ proxy.parseApprovalStatus(scope.row.approvalStatus) }}
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        fixed="right"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template #default="scope">
          <el-tooltip content="查看">
            <el-button
              link
              type="primary"
              size="small"
              icon="View"
              @click="toDetail(scope.row.id)"
            />
          </el-tooltip>
          <resubmitButton :row="scope.row" @openEditDrawer="openEditDrawer" />
          <revokeButton :row="scope.row" :auditType="1001" @refresh="getList" />
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryForm.pageNum"
      v-model:limit="queryForm.pageSize"
      @pagination="getList"
    />
  </div>

  <div class="drawer">
    <edit
      ref="editComponetRef"
      v-model:visit="editDrawer"
      :insertRules="insertRules"
      @filePreview="annexPreview"
      @refresh="getList"
    />
  </div>

  <el-dialog v-model="dialogVisible" title="预览" width="800px" append-to-body>
    <img
      :src="dialogImageUrl"
      style="display: block; max-width: 100%; margin: 0 auto"
    />
  </el-dialog>

  <el-dialog v-model="pdfDialogVisible" width="1000px">
    <div ref="pdfContainer"></div>
  </el-dialog>

  <add
    v-model:visit="insertDialogVisibleFlag"
    :insertRules="insertRules"
    @filePreview="annexPreview"
    @refresh="getList"
  />
</template>

<script setup name="Order">
import pdfObj from "pdfobject";
import { checkPermi } from "@/utils/permission";
import { reactive } from "vue";
import { pageQuery, delOrder } from "@/api/core/businessOrder";
import add from "./components/add.vue";
import edit from "./components/edit.vue";

const { proxy } = getCurrentInstance();

const showSearch = ref(true);
const visitFlag = ref(false);
const visitIcon = ref("View");
const visitText = ref("全部显示");

function visitHandle() {
  if (!visitFlag.value) {
    visitIcon.value = "Hide";
    visitText.value = "全部隐藏";
    visitFlag.value = true;
    if (orderList.value) {
      orderList.value.forEach((x) => {
        x.companyNameShow = x.companyName;
        x.companyNameVisitFlag = !x.companyNameVisitFlag;
        x.companyContactUserNameShow = x.companyContactUserName;
        x.companyContactUserNameVisitFlag = !x.companyContactUserNameVisitFlag;
        x.companyContactUserTelShow = x.companyContactUserTel;
        x.companyContactUserTelVisitFlag = !x.companyContactUserTelVisitFlag;
      });
    }
    return;
  }
  visitIcon.value = "View";
  visitText.value = "全部显示";
  visitFlag.value = false;
  if (orderList.value) {
    orderList.value.forEach((x) => {
      x.companyNameShow = hideCompanyName(x);
      x.companyNameVisitFlag = !x.companyNameVisitFlag;
      x.companyContactUserNameShow = hideCompanyContactUserName(x);
      x.companyContactUserNameVisitFlag = !x.companyContactUserNameVisitFlag;
      x.companyContactUserTelShow = hideCompanyContactUserTel(x);
      x.companyContactUserTelVisitFlag = !x.companyContactUserTelVisitFlag;
    });
  }
}

function resetQueryArea() {
  proxy.resetForm("queryFormRef");
  getList();
}

const queryFormRef = ref(null);
const queryForm = reactive({
  auditNo: undefined,
  createUser: undefined,
  approvalStatus: undefined,
  companyName: undefined,
  pageNum: 1,
  pageSize: 10,
});

const tableRef = ref(null);
function del() {
  proxy.$modal.confirm("确定删除吗？").then(() => {
    var ids = tableRef.value.getSelectionRows().map((x) => x.id);
    if (!ids.length) {
      getList();
      return;
    }
    delOrder(tableRef.value.getSelectionRows().map((x) => x.id))
      .then(() => {
        proxy.$message.success("删除成功");
        getList();
      })
      .catch(() => {
        proxy.$message.error("删除失败");
      });
  });
}

const loading = ref(true);
const total = ref(0);
function getList() {
  loading.value = true;
  pageQuery(queryForm).then((x) => {
    orderList.value = x.rows.map((x) => {
      x.companyNameShow = hideCompanyName(x);
      x.companyNameVisitFlag = false;
      x.companyContactUserNameShow = hideCompanyContactUserName(x);
      x.companyContactUserNameVisitFlag = false;
      x.companyContactUserTelShow = hideCompanyContactUserTel(x);
      x.companyContactUserTelVisitFlag = false;
      x.bizTypeList = x.itemList
        .map((x) => {
          return x.bizTypeName;
        })
        .join(", ");
      return x;
    });
    total.value = x.total;
    loading.value = false;
  });
}
const orderList = ref([]);

var insertDialogVisibleFlag = ref(false);
const insertRules = ref({
  paymentTime: [{ required: true, message: "请选择付款时间", trigger: "blur" }],
  companyName: [
    { required: true, message: "请输入甲方公司名称", trigger: "blur" },
    { min: 8, message: "请输入8位以上的甲方公司名称", trigger: "blur" },
  ],
  companyContactUserName: [
    { required: true, message: "请输入甲方联系人姓名", trigger: "blur" },
    { min: 2, message: "请输入2位以上的甲方联系人姓名", trigger: "blur" },
  ],
  companyContactUserTel: [
    { required: true, message: "请输入甲方联系人电话", trigger: "blur" },
    { min: 11, message: "请输入11位以上的甲方联系人电话", trigger: "blur" },
    {
      pattern: /^1[3456789]\d{9}$/,
      message: "请输入正确的手机号",
      trigger: "blur",
    },
  ],
  amount: [
    {
      required: true,
      type: "number",
      message: "请输入成交金额",
      trigger: "blur",
    },
  ],
  remark: [{ max: 500, message: "内容长度不能超过500", trigger: "blur" }],
  annexUrlList: [
    {
      required: true,
      type: "array",
      message: "请上传合同附件",
      trigger: "blur",
    },
  ],
  paymentScreenshotList: [
    {
      required: true,
      type: "array",
      message: "请上传打款截图",
      trigger: "blur",
    },
  ],
  bizTypeList: [
    {
      required: true,
      type: "array",
      message: "请选择业务类型",
      trigger: "blur",
    },
  ],
});

const editComponetRef = ref(null);
const editDrawer = ref(null);
function openEditDrawer(order) {
  editDrawer.value = true;
  editComponetRef.value.openEditDrawer(order);
}

function allowEdit(row, index) {
  return (
    row.approvalStatus === 4 ||
    row.approvalStatus === 2 ||
    row.approvalStatus === 5
  );
}

function viewCompanyName(row) {
  if (row.companyNameVisitFlag) {
    row.companyNameVisitFlag = !row.companyNameVisitFlag;
    row.companyNameShow = hideCompanyName(row);
    return;
  }
  row.companyNameVisitFlag = !row.companyNameVisitFlag;
  row.companyNameShow = row.companyName;
}

function viewCompanyContactUserName(row) {
  if (row.companyContactUserNameVisitFlag) {
    row.companyContactUserNameVisitFlag = !row.companyContactUserNameVisitFlag;
    row.companyContactUserNameShow = hideCompanyContactUserName(row);
    return;
  }
  row.companyContactUserNameVisitFlag = !row.companyContactUserNameVisitFlag;
  row.companyContactUserNameShow = row.companyContactUserName;
}

function viewCompanyContactUserTel(row) {
  if (row.companyContactUserTelVisitFlag) {
    row.companyContactUserTelVisitFlag = !row.companyContactUserTelVisitFlag;
    row.companyContactUserTelShow = hideCompanyContactUserTel(row);
    return;
  }
  row.companyContactUserTelVisitFlag = !row.companyContactUserTelVisitFlag;
  row.companyContactUserTelShow = row.companyContactUserTel;
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

const router = useRouter();
function toDetail(id) {
  router.push({
    path: `/approval/detail/1001/${id}`,
  });
}

getList();
</script>

<script>
function hideCompanyName(dest) {
  return (
    dest.companyName.substr(0, 2) +
    (function () {
      let str = "";
      let hideLength = dest.companyName.length - 4;
      for (let i = 0; i < hideLength; i++) {
        str += "*";
      }
      return str;
    })() +
    dest.companyName.substr(-2, 2)
  );
}

function hideCompanyContactUserName(dest) {
  if (dest.companyContactUserName.length <= 3) {
    return (
      dest.companyContactUserName.substr(0, 1) +
      Array.prototype.map
        .call(dest.companyContactUserName.substr(1), () => "*")
        .join("")
    );
  }
  return (
    dest.companyContactUserName.substr(0, 2) +
    Array.prototype.map
      .call(dest.companyContactUserName.substr(2), () => "*")
      .join("")
  );
}

function hideCompanyContactUserTel(dest) {
  if (!dest.companyContactUserTel) {
    return "";
  }
  return (
    dest.companyContactUserTel.substr(0, 3) +
    "****" +
    dest.companyContactUserTel.substr(-4)
  );
}
</script>

<style scoped lang="scss">
.drawer {
  :deep(.el-drawer__body) {
    padding-top: 0px;
  }
  :deep(.el-drawer__header) {
    margin-bottom: 0px;
  }
}
</style>