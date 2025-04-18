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
      <el-form-item
        label="审批状态"
        prop="approvalStatus"
        v-if="name !== 'ExpirationRemind'"
      >
        <ApprovalStatusSelect v-model:modelValue="queryForm.approvalStatus" />
      </el-form-item>
      <el-form-item label="服务起止时间" label-width="100" prop="serviceDate">
        <el-date-picker
          v-model="queryForm.serviceDate"
          type="daterange"
          range-separator="到"
          start-placeholder="服务开始时间"
          end-placeholder="服务截止时间"
          value-format="YYYY-MM-DD"
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
    <el-row :gutter="10" class="mb8" v-if="name === 'AccountAgencyApply'">
      <el-col :span="1.5" v-if="checkPermi(['account:agency:sensitive'])">
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
    <el-row
      :gutter="10"
      class="mb8"
      v-if="name == 'AccountAgency' && checkPermi(['account:agency:sensitive'])"
    >
      <el-col :span="1.5">
        <el-button type="success" plain :icon="visitIcon" @click="visitHandle">
          {{ visitText }}
        </el-button>
      </el-col>
    </el-row>

    <el-table stripe v-loading="loading" :data="dataList" ref="tableRef">
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
            v-if="checkPermi(['account:agency:sensitive'])"
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
            v-if="checkPermi(['account:agency:sensitive'])"
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
            v-if="checkPermi(['account:agency:sensitive'])"
            type="primary"
            text
            style="padding-left: 0px"
            @click="viewCompanyContactUserTel(scope.row)"
            >{{ scope.row.companyContactUserTelShow }}</el-button
          >
          <span v-else>{{ scope.row.companyContactUserTelShow }}</span>
        </template>
      </el-table-column>
      <el-table-column label="合同成交金额" prop="orderAmount" width="150" />
      <el-table-column label="代理记账服务费" prop="amount" width="150" />
      <el-table-column label="服务开始时间" prop="serviceBeginDate" width="150">
        <template #default="scope">
          {{ parseTime(scope.row.serviceBeginDate, "{y}-{m}-{d}") }}
        </template>
      </el-table-column>
      <el-table-column label="服务结束时间" prop="serviceEndDate" width="150">
        <template #default="scope">
          {{ parseTime(scope.row.serviceEndDate, "{y}-{m}-{d}") }}
        </template>
      </el-table-column>
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
          <viewButton
            :row="scope.row"
            v-model:detailDrawer="detailDrawer"
            v-model:nodeList="nodeList"
            v-model:viewDrawer="viewDrawer"
            :auditType="1002"
          />
          <resubmitButton
            v-if="name === 'AccountAgencyApply'"
            :row="scope.row"
            @openEditDrawer="openEditDrawer"
          />
          <revokeButton
            v-if="name === 'AccountAgencyApply'"
            :row="scope.row"
            :auditType="1002"
            @refresh="getList"
          />
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

  <el-dialog
    v-model="insertDialogVisibleFlag"
    title="保存"
    @close="closeInsertForm"
    :close-on-click-modal="false"
  >
    <add ref="addRef" @closeDialog="closeInsertForm" @refresh="getList" />
  </el-dialog>

  <edit
    v-model:dialogVisible="editDrawer"
    :modify-form="modifyForm"
    @refresh="getList"
  />

  <detail
    :view-drawer="viewDrawer"
    v-model:detailDrawer="detailDrawer"
    @refresh="getList"
    :node-list="nodeList"
  />
</template>
  
<script setup name="AccountAgency">
import { checkPermi } from "@/utils/permission";
import { parseTime } from "@/utils/oa";
import add from "./components/add.vue";
import { pageQuery, delBatch } from "@/api/core/accountAgency";
import detail from "./components/detail.vue";
import edit from "./components/edit.vue";

const { proxy } = getCurrentInstance();
const { name } = useRoute();
console.log(name);

const nodeList = ref([]);
var viewDrawer = ref({});
var detailDrawer = ref(false);

const showSearch = ref(true);
const queryFormRef = ref(null);
const queryForm = reactive({
  auditNo: undefined,
  createUser: undefined,
  approvalStatus: undefined,
  companyName: undefined,
  approvalStatusList: undefined,
  overdueFlag: undefined,
  serviceDate: undefined,
  pageNum: 1,
  pageSize: 10,
});
if (name !== "AccountAgencyApply") {
  if (name === "ExpirationRemind") {
    queryForm.overdueFlag = 1;
    queryForm.approvalStatus = 1;
  } else {
    queryForm.approvalStatusList = [0, 1];
  }
}

const visitFlag = ref(false);
const visitIcon = ref("View");
const visitText = ref("全部显示");
function visitHandle() {
  if (!visitFlag.value) {
    visitIcon.value = "Hide";
    visitText.value = "全部隐藏";
    visitFlag.value = true;
    if (dataList.value) {
      dataList.value.forEach((x) => {
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
  if (dataList.value) {
    dataList.value.forEach((x) => {
      x.companyNameShow = hideCompanyName(x);
      x.companyNameVisitFlag = !x.companyNameVisitFlag;
      x.companyContactUserNameShow = hideCompanyContactUserName(x);
      x.companyContactUserNameVisitFlag = !x.companyContactUserNameVisitFlag;
      x.companyContactUserTelShow = hideCompanyContactUserTel(x);
      x.companyContactUserTelVisitFlag = !x.companyContactUserTelVisitFlag;
    });
  }
}

const addRef = ref(null);

const closeInsertForm = () => {
  insertDialogVisibleFlag.value = false;
  addRef.value.clearAll();
};
var insertDialogVisibleFlag = ref(false);

var modifyForm = ref({});
var editDrawer = ref(false);
function openEditDrawer() {
  editDrawer.value = true;
  modifyForm.value = JSON.parse(JSON.stringify(arguments[0]));
  modifyForm.value.paymentTime = parseTime(
    new Date(modifyForm.value.paymentTime)
  );
  modifyForm.value.dateRange = [
    parseTime(new Date(modifyForm.value.serviceBeginDate), "{y}-{m}-{d}"),
    parseTime(new Date(modifyForm.value.serviceEndDate), "{y}-{m}-{d}"),
  ];
}

function allowEdit(row, index) {
  return (
    row.approvalStatus === 4 ||
    row.approvalStatus === 2 ||
    row.approvalStatus === 5
  );
}

const tableRef = ref(null);
function del() {
  proxy.$modal.confirm("确定删除吗？").then(() => {
    var ids = tableRef.value.getSelectionRows().map((x) => x.id);
    if (!ids.length) {
      getList();
      return;
    }
    delBatch(ids)
      .then(() => {
        proxy.$message.success("删除成功");
        getList();
      })
      .catch(() => {
        proxy.$message.error("删除失败");
      });
  });
}

function resetQueryArea() {
  proxy.resetForm("queryFormRef");
  getList();
}

const dataList = ref([]);
const loading = ref(true);
const total = ref(0);
const getList = () => {
  loading.value = true;
  var query = {};
  Object.assign(query, queryForm);
  if (query.serviceDate) {
    query.serviceBeginDate = queryForm.serviceDate[0];
    query.serviceEndDate = queryForm.serviceDate[1];
  }
  pageQuery(query).then((x) => {
    dataList.value = x.rows.map((x) => {
      x.companyNameShow = hideCompanyName(x);
      x.companyNameVisitFlag = false;
      x.companyContactUserNameShow = hideCompanyContactUserName(x);
      x.companyContactUserNameVisitFlag = false;
      x.companyContactUserTelShow = hideCompanyContactUserTel(x);
      x.companyContactUserTelVisitFlag = false;
      return x;
    });
    total.value = x.total;
    loading.value = false;
  });
};

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

onMounted(() => {
  getList();
});
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
  return (
    dest.companyContactUserTel.substr(0, 3) +
    "****" +
    dest.companyContactUserTel.substr(-4)
  );
}
</script>