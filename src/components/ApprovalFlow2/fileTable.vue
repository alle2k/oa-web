<template>
  <el-table class="fileTable" border :data="list">
    <template #empty>暂无附件</template>
    <el-table-column
      width="100"
      align="center"
      prop="fileType"
      label="附件类型"
    >
      <template #default="{ row }">
        <el-image style="width: 30px; height: 30px" :src="getIcon(row)" />
      </template>
    </el-table-column>
    <el-table-column label="附件名称" align="center">
      <template #default="scope">
        <el-popover effect="light" trigger="hover" placement="top" width="auto">
          <template #default>
            <span>{{ scope.row }}</span>
          </template>
          <template #reference>
            <el-button type="primary" @click="annexPreview(scope.row)" link>
              {{ scope.row.substr(scope.row.lastIndexOf("/") + 1) }}
            </el-button>
          </template>
        </el-popover>
      </template>
    </el-table-column>
    <el-table-column label="下载" align="center">
      <template #default="scope">
        <el-button link type="primary" @click="download(scope.row)"
          >下载</el-button
        >
      </template>
    </el-table-column>
  </el-table>

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
import zip from "@/assets/images/zip.png";
import word from "@/assets/images/word.png";
import xls from "@/assets/images/xls.png";
import pdf from "@/assets/images/pdf.png";
import pdfObj from "pdfobject";

const props = defineProps({
  list: {
    type: Array,
    required: true,
  },
});
const list = computed(() => props.list);

const getIcon = (row) => {
  if (!row) {
    return;
  }
  const img = row;
  if (img.includes("zip") || img.includes("rar")) {
    return zip;
  } else if (
    img.includes("png") ||
    img.includes("jpg") ||
    img.includes("jpeg")
  ) {
    return row;
  } else if (img.includes("docx") || img.includes("doc")) {
    return word;
  } else if (img.includes("xls") || img.includes("xlsx")) {
    return xls;
  } else if (img.includes("pdf")) {
    return pdf;
  }
};

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

function download(targetUrl) {
  window.location = targetUrl;
}
</script>

<style scoped lang="scss">
.subtitle {
  border-left: 3px solid #515a6e;
  padding-left: 5px;
  display: block;
  font-weight: bold;
  margin: 22px 0;
  color: #515a6e;
}

.fileTable {
  margin: 5px 0;
  :deep(.el-table__header) {
    display: none;
  }
  :deep(.cell) {
    line-height: 16px !important;
  }
}
</style>