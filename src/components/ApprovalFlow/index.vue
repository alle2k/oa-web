<template>
  <div class="approvalFlow" v-if="flowNodeList.length">
    <h3 style="padding-left: 10px; padding-top: 15px; color: #303133">
      审批详情
    </h3>
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
            {{ parseTime(item.nodeTime, '{y}-{m}-{d} {h}:{i}') }}
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
            <span>{{ item?.commentInfo ? '：' + item?.commentInfo : '' }}</span>
          </span>
        </div>
      </el-timeline-item>
    </el-timeline>
    <el-row
      :gutter="8"
      class="mb8"
      v-hasPermi="['approval']"
      v-if="approvalStatus === 0 && visibleAudit"
    >
      <el-col :span="1.5" :offset="9">
        <el-button color="#626aef" round>转审</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button color="#626aef" round @click="auditDialogShow('goBack')"
          >退回</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button-group>
          <el-button type="primary" round @click="auditDialogShow('agree')"
            >同意</el-button
          >
          <el-button type="danger" round @click="auditDialogShow('reject')"
            >拒绝</el-button
          >
        </el-button-group>
      </el-col>
    </el-row>
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
import adoptIcon from '@/assets/images/adoptIcon.png'
import returnUserIcon from '@/assets/images/returnUserIcon.png'
import ccIcon from '@/assets/images/ccIcon.png'
import waitIcon from '@/assets/images/waitIcon.png'
import refuseIcon from '@/assets/images/refuseIcon.png'
import SvgIcon from '@/components/SvgIcon'
import { ElImage } from 'element-plus'
import { parseTime, specialApprovalForm } from '@/utils/oa'
import { audit, rollback } from '@/api/core/flowable'
import pdfObj from 'pdfobject'

const { proxy } = getCurrentInstance()

const props = defineProps({
  nodeList: {
    type: Array,
    default: () => []
  },
  approvalStatus: {
    type: Number,
    default: 0
  },
  auditType: {
    type: Number,
    default: 1001
  },
  bizId: {
    type: Number,
    default: 0
  },
  visibleAudit: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['refresh'])

const visibleAudit = computed(() => {
  return props.visibleAudit
})

const flowNodeList = computed(() => {
  return props.nodeList || []
})

const approvalStatus = computed(() => {
  return props.approvalStatus
})

var auditOperate = ref(null)
var auditFormRef = ref(null)
var auditDialogVisibleFlag = ref(false)
var specialFormFields = ref(null)
var auditForm = ref({
  remark: '',
  annexUrlList: []
})
const defaultAuditRules = {
  remark: [
    {
      required: false,
      max: 500,
      message: '内容长度不能超过500',
      trigger: 'blur'
    }
  ]
}
const auditRules = ref({
  remark: [
    {
      required: false,
      max: 500,
      message: '内容长度不能超过500',
      trigger: 'blur'
    }
  ]
})

const pdfDialogVisible = ref(false)
const pdfContainer = ref(null)
const dialogImageUrl = ref('')
const dialogVisible = ref(false)
const annexPreview = async (arg) => {
  var fileUrl = ''
  if (typeof arg === 'string') {
    fileUrl = arg
  } else if ('response' in arg && typeof arg['response'] === 'object') {
    fileUrl = arg.response?.data
  }
  if (fileUrl.lastIndexOf('.pdf') > 0) {
    const response = await fetch(fileUrl)
    const blob = await response.blob()
    const pdfUrl = URL.createObjectURL(blob)
    pdfDialogVisible.value = true
    nextTick(() => {
      pdfObj.embed(pdfUrl, pdfContainer.value, {
        width: '100%',
        height: '800px'
      })
    })
    return
  }
  dialogImageUrl.value = fileUrl
  dialogVisible.value = true
}

const customIcon = (x) => {
  let statusImg
  if (x.nodeType == 4 || x.nodeType == 5) {
    statusImg = returnUserIcon
  } else if (x.nodeType == 6) {
    statusImg = ccIcon
  } else if (x.auditStatus == 3) {
    statusImg = waitIcon
  } else if (x.auditStatus == 2) {
    statusImg = refuseIcon
  } else {
    statusImg = adoptIcon
  }

  const statusIcon = h(ElImage, {
    src: statusImg,
    style: {
      position: 'absolute',
      width: '18px',
      height: '18px',
      right: '-4px',
      bottom: '-6px'
    }
  })
  const eleArray = []
  if (
    !x.nodeCandidateInfo ||
    x.nodeCandidateInfo.length < 1 ||
    x.nodeCandidateInfo.length > 1
  ) {
    const _div = h(
      'div',
      {
        style: {
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontStyle: 'normal',
          width: '30px',
          height: '30px',
          borderRadius: '30px',
          backgroundColor: '#1378f6'
        }
      },
      [
        h(SvgIcon, {
          iconClass: 'user'
        })
      ]
    )
    // const defaultDisplay = h(SvgIcon, {
    //   iconClass: 'user'
    // })
    eleArray.push(_div)
    eleArray.push(statusIcon)
    return h('div', null, eleArray)
  }
  var photo
  if ((photo = x.nodeCandidateInfo[0].userPhoto)) {
    const typeIcon = h(ElImage, {
      src: photo,
      fit: 'fill',
      style: {
        width: '30px',
        height: '30px',
        borderRadius: '30px'
      }
    })
    eleArray.push(typeIcon)
    eleArray.push(statusIcon)
    return h('div', null, eleArray)
  }
  const _div = h('div', {
    innerHTML: x.nodeCandidateInfo[0].userName.substr(0, 1),
    style: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontStyle: 'normal',
      width: '30px',
      height: '30px',
      borderRadius: '30px',
      backgroundColor: '#1378f6'
    }
  })
  eleArray.push(_div)
  eleArray.push(statusIcon)
  return h('div', null, eleArray)
}

const getAuditUser = (list = []) => {
  let result = ''
  if (list.length > 2) {
    result = list
      .map((item) => {
        return item.userName
      })
      .slice(0, 2)
      .join('、')
    result += `等${list.length}人`
  } else {
    result = list
      .map((item) => {
        return item.userName
      })
      .join('、')
  }
  return result
}

function auditDialogShow(operate) {
  auditDialogVisibleFlag.value = true
  auditOperate.value = operate
}

function openAuditFormDialog() {
  var defaultAuditRulesBak = JSON.parse(JSON.stringify(defaultAuditRules))
  if (auditOperate.value !== 'agree') {
    defaultAuditRulesBak.remark[0].required = true
    auditRules.value = {
      ...defaultAuditRulesBak
    }
    return
  }

  var taskId = props.nodeList[props.nodeList.length - 1].taskKey
  // 获取特殊表单字段配置
  const formConfig = specialApprovalForm()
  if (formConfig[taskId]) {
    specialFormFields.value = formConfig[taskId]

    // 初始化表单值和校验规则
    const rules = {}
    Object.keys(formConfig[taskId]).forEach((key) => {
      const field = formConfig[taskId][key]
      auditForm.value[key] = field.type === 'number' ? 0 : ''

      if (field.required) {
        rules[key] = [
          {
            required: true,
            message: `请输入${field.label}`,
            trigger: 'blur',
            type: field.type === 'number' ? 'number' : 'string'
          }
        ]
      }
    })

    // 合并校验规则
    auditRules.value = {
      ...defaultAuditRulesBak,
      ...rules
    }
  } else {
    specialFormFields.value = null
  }
}

const obsFileUploadRef = ref(null)
function closeAuditFormDialog() {
  auditDialogVisibleFlag.value = false
  specialFormFields.value = null
  auditOperate.value = null
  auditForm.value = {
    remark: '',
    annexUrlList: []
  }
  obsFileUploadRef.value.clearAll()
  proxy.resetForm('auditFormRef')
}

function submitAuditForm(form) {
  if (!form) {
    return
  }
  form.validate((valid) => {
    if (valid) {
      var data = {}
      data.id = props.bizId
      data.auditType = props.auditType
      data.comment = {
        remark: auditForm.value.remark,
        annexUrl: auditForm.value.annexUrlList
      }
      // 处理动态表单字段
      if (specialFormFields.value) {
        const extraData = {}
        Object.keys(specialFormFields.value).forEach((key) => {
          if (key in auditForm.value) {
            extraData[key] = auditForm.value[key]
          }
        })
        if (Object.keys(extraData).length > 0) {
          data.extra = JSON.stringify(extraData)
        }
      }
      if (auditOperate.value === 'agree' || auditOperate.value === 'reject') {
        data.auditAction = auditOperate.value
        audit(data).then((response) => {
          proxy.$modal.msgSuccess('操作成功')
          emit('refresh')
        })
      } else {
        data.operateType = 0
        rollback(data).then((response) => {
          proxy.$modal.msgSuccess('操作成功')
          emit('refresh')
        })
      }
      closeAuditFormDialog()
    }
  })
}
</script>

<style scoped lang="scss">
.approvalFlow {
  background-color: rgb(242, 243, 245);
  margin-left: -10px;
  margin-right: -10px;
  padding-bottom: 1px;
  border-radius: 15px;

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
  :deep(.el-timeline-item__node--large) {
    // width: 30px;
    // height: 30px;
    // left: -10px;
    background-color: rgb(242, 243, 245);
  }
}
</style>
