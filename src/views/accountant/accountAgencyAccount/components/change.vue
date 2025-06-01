<template>
  <div class="accountChange">
    <el-table ref="tableRef" border :data="list">
      <el-table-column prop="desc" align="center" label="申请类型">
      </el-table-column>
      <el-table-column prop="shortInfo" align="center" label="摘要">
        <template #default="{ row }">
          <div style="text-align: left">
            <p>发起时间：{{ parseTime(row.createTime) }}</p>
            <p>
              完成时间：{{
                row.approvalTime ? parseTime(row.approvalTime) : ""
              }}
            </p>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="createUser" align="center" label="发起人员">
        <template #default="{ row }">
          <div style="justify-content: center; display: flex">
            <component :is="getIcon(row)"> </component>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="price" align="center" label="金额">
        <template #default="{ row }">
          <div style="color: rgb(217, 0, 27)">
            {{ `¥${row.amount.toFixed(2)}` }}
          </div>
        </template>
      </el-table-column>
      <el-table-column
        prop="operate"
        align="center"
        min-width="100"
        label="操作"
      >
        <template #default="{ row }">
          <el-button @click="toDetail(row)" type="primary"> 查看 </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { parseTime } from "@/utils/oa";
import { getOrderAccountAgencyDetailsByOrderId } from "@/api/core/accountAgencyAccount";
import { ElImage } from "element-plus";

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
});

function getIcon(row) {
  const eleArray = [];
  const defaultImg = h(
    "div",
    {
      style: {
        width: "38px",
        height: "38px",
        marginRight: "8px",
        background: "#2693FE",
        borderRadius: "50%",
        color: "#fff",
        lineHeight: "38px",
        fontWeight: "bold",
      },
    },
    row.createUserName?.substring(0, 1) || ""
  );
  const userImg = h(ElImage, {
    src: row.avatar,
    style: {
      width: "38px",
      height: "38px",
      marginRight: "12px",
      borderRadius: "50%",
    },
  });
  const ele = row.avatar ? userImg : defaultImg;
  eleArray.push(ele);
  eleArray.push(h("span", row.createUserName));
  return row.createUserName
    ? h(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            justifyContent: "start",
          },
        },
        eleArray
      )
    : "";
}

const router = useRouter();
function toDetail(obj) {
  router.push({
    path: `/approval/detail/${obj.bizType}/${obj.bizId}`,
  });
}

const list = ref([]);
onMounted(() => {
  getOrderAccountAgencyDetailsByOrderId({
    id: props.data.orderId,
  }).then((res) => {
    list.value = res.data;
  });
});
</script>

<style scoped lang="scss">
.accountChange {
  height: 80vh;
  :deep(.el-table--border .el-table__cell) {
    border-right: none;
  }
}
</style>
