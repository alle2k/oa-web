<template>
  <el-upload
    v-model:file-list="fileList"
    action="#"
    :limit="limit"
    :before-upload="beforeUploadHandle"
    :on-preview="handlePreview"
    list-type="text"
    accept=".jpg,.jpeg,.png,.pdf"
    :http-request="httpRequest"
    :on-error="handleUploadError"
    :on-exceed="handleExceed"
    :on-success="handleUploadSuccess"
    :on-remove="handleRemove"
  >
    <el-button type="primary" icon="Paperclip">上传附件</el-button>
    <template #tip>
      <el-text style="display: block"
        >仅支持上传图片或PDF文件，且不超过3个</el-text
      >
    </template>
  </el-upload>
</template>

<script setup>
import { upload } from "@/api/core/obs";
const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
  limit: {
    type: Number,
    default: 3,
  },
  fileSize: {
    type: Number,
    default: 5,
  },
});
const emit = defineEmits(["filePreview", "update:modelValue"]);
const { proxy } = getCurrentInstance();
const fileList = ref(props.modelValue || []);

function httpRequest(options) {
  const { file, onProgress, data, filename = "file" } = options;
  const formData = new FormData();
  formData.append(filename, file);
  return upload(formData, {
    // 实时监听上传文件的进度，并在每次上传进度更新时被触发。由 Axios（或者你使用的 HTTP 库）提供的功能。你不需要单独定义它，因为它是作为 config 配置对象的一部分传递给 Axios 的
    // total: 总大小; loaded: 已经上传的字节数;
    onUploadProgress: ({ total, loaded }) => {
      // 更新上传进度
      onProgress({ percent: Math.round((loaded / total) * 100) });
    },
  });
}

function beforeUploadHandle(file) {
  const type = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
  const flag = type.includes(file.type);
  if (!flag) {
    proxy.$modal.msgError("文件格式错误!");
    return false;
  }
  const isLt = file.size / 1024 / 1024 < 5;
  if (!isLt) {
    proxy.$modal.msgError(`上传文件大小不能超过 ${props.fileSize} MB!`);
    return false;
  }
  proxy.$modal.loading("正在上传图片，请稍候...");
  return true;
}

// 上传成功回调
function handleUploadSuccess(res, file, files) {
  proxy.$modal.closeLoading();
  if (res.code !== 200) {
    proxy.$modal.msgError(res.msg);
  }
  emit(
    "update:modelValue",
    files.map((x) => {
      return x.response.data;
    })
  );
}

// 移除文件
function handleRemove(file, files) {
  emit(
    "update:modelValue",
    files.map((x) => {
      return x.response.data;
    })
  );
}

// 文件个数超出
function handleExceed() {
  proxy.$modal.msgError(`上传文件数量不能超过 ${props.limit} 个!`);
}

// 上传失败
function handleUploadError(err) {
  proxy.$modal.msgError("上传文件失败");
}

// 预览
function handlePreview(file) {
  emit("filePreview", file);
}

function clearAll() {
  fileList.value = [];
}

defineExpose({
  clearAll,
});
</script>