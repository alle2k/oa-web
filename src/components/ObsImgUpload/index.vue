<template>
  <el-upload
    v-model:file-list="fileList"
    list-type="picture-card"
    :on-preview="handlePreview"
    :limit="limit"
    :before-upload="paymentScreenshotBeforeUpload"
    accept=".jpg,.jpeg,.png"
    :http-request="httpRequest"
    :on-error="handleUploadError"
    :on-exceed="handleExceed"
    :on-success="handleUploadSuccess"
    :on-remove="handleRemove"
  >
    <el-icon><Plus /></el-icon>
  </el-upload>
</template>

<script setup >
import { upload } from '@/api/core/obs'
const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  limit: {
    type: Number,
    default: 3
  },
  fileSize: {
    type: Number,
    default: 5
  }
})
const emit = defineEmits(['filePreview', 'update:modelValue'])
const { proxy } = getCurrentInstance()
const fileList = ref(props.modelValue || [])

function paymentScreenshotBeforeUpload(file) {
  let isImg = false
  var fileTypeArr = ['png', 'jpg', 'jpeg']
  let fileExtension = ''
  if (file.name.lastIndexOf('.') > -1) {
    fileExtension = file.name.slice(file.name.lastIndexOf('.') + 1)
  }
  isImg = fileTypeArr.some((type) => {
    if (file.type.indexOf(type) > -1) return true
    if (fileExtension && fileExtension.indexOf(type) > -1) return true
    return false
  })
  if (!isImg) {
    proxy.$modal.msgError(
      `文件格式不正确，请上传${fileTypeArr.join('/')}图片格式文件!`
    )
    return false
  }
  if (file.name.includes(',')) {
    proxy.$modal.msgError('文件名不正确，不能包含英文逗号!')
    return false
  }
  const isLt = file.size / 1024 / 1024 < props.fileSize
  if (!isLt) {
    proxy.$modal.msgError(`上传图片大小不能超过${props.fileSize}MB!`)
    return false
  }
  proxy.$modal.loading('正在上传图片，请稍候...')
}

function httpRequest(options) {
  const { file, onProgress, data, filename = 'file' } = options
  const formData = new FormData()
  formData.append(filename, file)
  return upload(formData, {
    // 实时监听上传文件的进度，并在每次上传进度更新时被触发。由 Axios（或者你使用的 HTTP 库）提供的功能。你不需要单独定义它，因为它是作为 config 配置对象的一部分传递给 Axios 的
    // total: 总大小; loaded: 已经上传的字节数;
    onUploadProgress: ({ total, loaded }) => {
      // 更新上传进度
      onProgress({ percent: Math.round((loaded / total) * 100) })
    }
  })
}

// 上传成功回调
function handleUploadSuccess(res, file, files) {
  proxy.$modal.closeLoading()
  if (res.code !== 200) {
    proxy.$modal.msgError(res.msg)
  }
  emit(
    'update:modelValue',
    files.map((x) => {
      return x.response.data
    })
  )
}

// 移除文件
function handleRemove(file, files) {
  emit(
    'update:modelValue',
    files.map((x) => {
      return x.response.data
    })
  )
}

// 文件个数超出
function handleExceed() {
  proxy.$modal.msgError(`上传文件数量不能超过 ${props.limit} 个!`)
}

// 上传失败
function handleUploadError(err) {
  proxy.$modal.msgError('上传文件失败')
}

// 预览
function handlePreview(file) {
  emit('filePreview', file)
}

function clearAll() {
  fileList.value = [];
}

defineExpose({
  clearAll,
});
</script>
