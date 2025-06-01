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
      <el-form-item label="合同编号" prop="contractNo">
        <el-input
          placeholder="请输入合同编号"
          style="width: 240px"
          clearable
          v-model="queryForm.contractNo"
        />
      </el-form-item>
      <el-form-item label="提交人" prop="createUser">
        <UserSelect v-model:userSelectModel="queryForm.createUser" />
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
    </el-form>
    <el-row :gutter="10" class="mb8">
      <el-button type="primary" icon="Search" @click="getList">查询</el-button>
      <el-button type="Refresh" icon="RefreshRight" @click="resetQueryArea"
        >重置</el-button
      >
      <el-button type="success" plain :icon="visitIcon" @click="visitHandle">
        {{ visitText }}
      </el-button>
      <RightToolbar v-model:showSearch="showSearch" @queryTable="getList" />
    </el-row>

    <el-table stripe v-loading="loading" :data="dataList" ref="tableRef">
      <el-table-column fixed label="合同编号" prop="contractNo" width="150" />
      <el-table-column label="甲方公司名称" prop="companyNameShow" width="210">
        <template #default="scope">
          <el-button
            v-if="checkPermi(['account:agency:sensitive'])"
            type="primary"
            link
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
            link
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
            link
            style="padding-left: 0px"
            @click="viewCompanyContactUserTel(scope.row)"
            >{{ scope.row.companyContactUserTelShow }}</el-button
          >
          <span v-else>{{ scope.row.companyContactUserTelShow }}</span>
        </template>
      </el-table-column>
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
      <el-table-column label="操作" fixed="right" align="center" width="150">
        <template #default="scope">
          <el-button link type="primary" @click="toInfo(scope.row.id)"
            >详情</el-button
          >
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
</template>
  
<script setup name="AccountAgency">
import { checkPermi } from "@/utils/permission";
import { parseTime } from "@/utils/oa";
import { pageQuery } from "@/api/core/accountAgencyAccount";

const { proxy } = getCurrentInstance();

const showSearch = ref(true);
const queryFormRef = ref(null);
const queryForm = reactive({
  contractNo: undefined,
  createUser: undefined,
  approvalStatus: undefined,
  companyName: undefined,
  approvalStatusList: undefined,
  overdueFlag: undefined,
  serviceDate: undefined,
  pageNum: 1,
  pageSize: 10,
});

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

const tableRef = ref(null);

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

const router = useRouter();
function toInfo(id) {
  router.push({
    path: `/accountant/accountAgency/info/${id}`,
  });
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