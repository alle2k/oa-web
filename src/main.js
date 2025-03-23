import { createApp } from 'vue'

import Cookies from 'js-cookie'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import locale from 'element-plus/es/locale/lang/zh-cn'

import '@/assets/styles/index.scss' // global css

import App from './App'
import store from './store'
import router from './router'
import directive from './directive' // directive

// 注册指令
import plugins from './plugins' // plugins
import { download } from '@/utils/request'

// svg图标
import 'virtual:svg-icons-register'
import SvgIcon from '@/components/SvgIcon'
import elementIcons from '@/components/SvgIcon/svgicon'

import './permission' // permission control

import { useDict } from '@/utils/dict'
import { parseTime, resetForm, addDateRange, handleTree, selectDictLabel, selectDictLabels, parseApprovalStatus } from '@/utils/oa'

// 分页组件
import Pagination from '@/components/Pagination'
// 自定义表格工具组件
import RightToolbar from '@/components/RightToolbar'
// 富文本组件
import Editor from "@/components/Editor"
// 文件上传组件
import FileUpload from "@/components/FileUpload"
// 图片上传组件
import ImageUpload from "@/components/ImageUpload"
// 图片预览组件
import ImagePreview from "@/components/ImagePreview"
// 字典标签组件
import DictTag from '@/components/DictTag'
// 用户下拉框组件
import UserSelect from '@/components/UserSelect'
// Obs文件上传组件
import ObsFileUpload from '@/components/ObsFileUpload'
// Obs图片上传组件
import ObsImgUpload from '@/components/ObsImgUpload'
// 审批状态下拉框组件
import ApprovalStatusSelect from '@/components/ApprovalStatusSelect'
// 审批操作按钮组件 
import viewButton from '@/components/ApprovalOperateButton/viewButton'
import resubmitButton from '@/components/ApprovalOperateButton/resubmitButton'
import revokeButton from '@/components/ApprovalOperateButton/revokeButton'
// 审批流组件
import ApprovalFlow from '@/components/ApprovalFlow'

const app = createApp(App)

// 全局方法挂载
app.config.globalProperties.useDict = useDict
app.config.globalProperties.download = download
app.config.globalProperties.parseTime = parseTime
app.config.globalProperties.resetForm = resetForm
app.config.globalProperties.handleTree = handleTree
app.config.globalProperties.addDateRange = addDateRange
app.config.globalProperties.selectDictLabel = selectDictLabel
app.config.globalProperties.selectDictLabels = selectDictLabels
app.config.globalProperties.parseApprovalStatus = parseApprovalStatus

// 全局组件挂载
app.component('DictTag', DictTag)
app.component('Pagination', Pagination)
app.component('FileUpload', FileUpload)
app.component('ImageUpload', ImageUpload)
app.component('ImagePreview', ImagePreview)
app.component('RightToolbar', RightToolbar)
app.component('Editor', Editor)
app.component('UserSelect', UserSelect)
app.component('ObsFileUpload', ObsFileUpload)
app.component('ObsImgUpload', ObsImgUpload)
app.component('ApprovalStatusSelect', ApprovalStatusSelect)
app.component('viewButton', viewButton)
app.component('resubmitButton', resubmitButton)
app.component('revokeButton', revokeButton)
app.component('ApprovalFlow', ApprovalFlow)
app.use(router)
app.use(store)
app.use(plugins)
app.use(elementIcons)
app.component('svg-icon', SvgIcon)

directive(app)

// 使用element-plus 并且设置全局的大小
app.use(ElementPlus, {
  locale: locale,
  // 支持 large、default、small
  size: Cookies.get('size') || 'default'
})

app.mount('#app')