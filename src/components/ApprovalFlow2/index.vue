<template>
  <div class="approvalFlow" v-if="flowNodeList.length">
    <el-timeline>
      <el-timeline-item
        v-for="(item, idx) in flowNodeList"
        :key="idx"
        size="large"
        :icon="customIcon(item)"
        type="primary"
      >
        <div
          style="
            display: flex;
            justify-content: space-between;
            padding-right: 10px;
          "
        >
          <span v-if="item.nodeType == 1">发起人申请</span>
          <span v-else-if="item.nodeType == 3">转交人审批</span>
          <span v-else-if="item.nodeType == 7">发起人重新提交申请</span>
          <span v-else-if="item.nodeType == 6">审批流抄送阅读</span>
          <span v-else>{{ item.nodeName }}</span>
          <span>
            {{ parseTime(item.nodeTime, "{y}-{m}-{d} {h}:{i}") }}
          </span>
        </div>
        <div class="approvalInfo">
          <span v-if="item.nodeType == 7">
            {{ item?.nodeCandidateInfo[0]?.userName }}
          </span>
          <span v-else-if="item.nodeType == 6">
            已抄送给 {{ getAuditUser(item?.nodeCandidateInfo) }}
          </span>
          <span v-else-if="item.auditStatus == 3">
            {{ getAuditUser(item?.nodeCandidateInfo || []) }}(审批中)
          </span>
          <span v-else>
            {{ item?.nodeCandidateInfo[0]?.userName }}
            <span>{{ item?.commentInfo ? "：" + item?.commentInfo : "" }}</span>
          </span>
        </div>
      </el-timeline-item>
    </el-timeline>
  </div>
</template>

<script setup>
import adoptIcon from "@/assets/images/adoptIcon.png";
import returnUserIcon from "@/assets/images/returnUserIcon.png";
import ccIcon from "@/assets/images/ccIcon.png";
import waitIcon from "@/assets/images/waitIcon.png";
import refuseIcon from "@/assets/images/refuseIcon.png";
import SvgIcon from "@/components/SvgIcon";
import { ElImage } from "element-plus";

const props = defineProps({
  nodeInfo: {
    type: Array,
    default: () => [],
  },
});

const flowNodeList = computed(() => {
  return props.nodeInfo || [];
});

const customIcon = (x) => {
  let statusImg;
  if (x.nodeType == 4 || x.nodeType == 5) {
    statusImg = returnUserIcon;
  } else if (x.nodeType == 6) {
    statusImg = ccIcon;
  } else if (x.auditStatus == 3) {
    statusImg = waitIcon;
  } else if (x.auditStatus == 2) {
    statusImg = refuseIcon;
  } else {
    statusImg = adoptIcon;
  }

  const statusIcon = h(ElImage, {
    src: statusImg,
    style: {
      position: "absolute",
      width: "18px",
      height: "18px",
      right: "-4px",
      bottom: "-6px",
    },
  });
  const eleArray = [];
  if (
    !x.nodeCandidateInfo ||
    x.nodeCandidateInfo.length < 1 ||
    x.nodeCandidateInfo.length > 1
  ) {
    const _div = h(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontStyle: "normal",
          width: "30px",
          height: "30px",
          borderRadius: "30px",
          backgroundColor: "#1378f6",
        },
      },
      [
        h(SvgIcon, {
          iconClass: "user",
        }),
      ]
    );
    // const defaultDisplay = h(SvgIcon, {
    //   iconClass: 'user'
    // })
    eleArray.push(_div);
    eleArray.push(statusIcon);
    return h("div", null, eleArray);
  }
  var photo;
  if ((photo = x.nodeCandidateInfo[0].userPhoto)) {
    const typeIcon = h(ElImage, {
      src: photo,
      fit: "fill",
      style: {
        width: "30px",
        height: "30px",
        borderRadius: "30px",
      },
    });
    eleArray.push(typeIcon);
    eleArray.push(statusIcon);
    return h("div", null, eleArray);
  }
  const _div = h("div", {
    innerHTML: x.nodeCandidateInfo[0].userName.substr(0, 1),
    style: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontStyle: "normal",
      width: "30px",
      height: "30px",
      borderRadius: "30px",
      backgroundColor: "#1378f6",
    },
  });
  eleArray.push(_div);
  eleArray.push(statusIcon);
  return h("div", null, eleArray);
};

const getAuditUser = (list = []) => {
  let result = "";
  if (list.length > 2) {
    result = list
      .map((item) => {
        return item.userName;
      })
      .slice(0, 2)
      .join("、");
    result += `等${list.length}人`;
  } else {
    result = list
      .map((item) => {
        return item.userName;
      })
      .join("、");
  }
  return result;
};
</script>

<style scoped lang="scss">
.approvalFlow {
  :deep(.el-timeline) {
    margin-top: 30px;
    padding-left: 20px;
    padding-bottom: 30px;
  }
  :deep(.el-timeline-item__node) {
    margin-left: -8px;
    width: 30px;
    height: 30px;
  }
  :deep(.el-timeline-item__content) {
    padding-left: 10px;
  }
  :deep(.el-timeline-item__icon) {
    width: 30px !important;
    height: 30px !important;
  }
}
</style>
