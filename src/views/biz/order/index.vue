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
        <UserSelect
          v-model:userSelectModel="queryForm.createUser"
          @userSelectChange="test"
        />
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
          <viewButton
            :row="scope.row"
            v-model:detailDrawer="detailDrawer"
            v-model:nodeList="nodeList"
            v-model:viewDrawer="viewDrawer"
          />
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
    <el-drawer
      v-model="detailDrawer"
      title="详情"
      direction="rtl"
      @close="closeDetailDrawer"
    >
      <template #default>
        <div style="position: relative; margin-bottom: 20px">
          <el-image
            :src="approvalStatusImgMap[viewDrawer.approvalStatus]"
            style="width: 120px; height: 120px; position: absolute; right: 0"
          />
        </div>
        <el-descriptions column="1">
          <el-descriptions-item label="审批编号：">
            <span style="margin-left: 42px">{{ viewDrawer.auditNo }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="付款时间：">
            <span style="margin-left: 42px">{{
              parseTime(new Date(viewDrawer.paymentTime))
            }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="甲方公司名称：">
            <el-button
              v-if="checkPermi(['biz:order:sensitive'])"
              type="primary"
              @click="viewCompanyName(viewDrawer)"
              text
              >{{ viewDrawer.companyNameShow }}</el-button
            >
            <span v-else style="margin-left: 14px">{{
              viewDrawer.companyNameShow
            }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="甲方联系人姓名：">
            <el-button
              v-if="checkPermi(['biz:order:sensitive'])"
              type="primary"
              @click="viewCompanyContactUserName(viewDrawer)"
              text
              style="padding-left: 0px"
              >{{ viewDrawer.companyContactUserNameShow }}</el-button
            >
            <span v-else>{{ viewDrawer.companyContactUserNameShow }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="甲方联系人电话：">
            <el-button
              v-if="checkPermi(['biz:order:sensitive'])"
              type="primary"
              @click="viewCompanyContactUserTel(viewDrawer)"
              text
              style="padding-left: 0px; padding-right: 0px"
            >
              {{ viewDrawer.companyContactUserTelShow }}
            </el-button>
            <span v-else>{{ viewDrawer.companyContactUserTelShow }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="业务类型：">
            <el-tooltip :content="viewDrawer.bizTypeList">
              <div style="margin-left: 42px; display: inline-flex">
                <span
                  style="
                    display: inline-block;
                    width: 200px;
                    white-space: nowrap;
                    overflow: hidden; /* 隐藏溢出的文本 */
                    text-overflow: ellipsis; /* 显示省略号 */
                  "
                  >{{ viewDrawer.bizTypeList }}</span
                >
              </div>
            </el-tooltip>
          </el-descriptions-item>
          <el-descriptions-item label="成交金额：">
            <span style="margin-left: 42px">{{ viewDrawer.amount }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="业绩：">
            <span style="margin-left: 70px">{{ viewDrawer.performance }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="备注：">
            <el-popover
              effect="light"
              trigger="hover"
              placement="top"
              width="auto"
            >
              <template #default>
                {{ viewDrawer.remark }}
              </template>
              <template #reference>
                <span
                  style="
                    display: inline-block;
                    margin-left: 70px;
                    width: 280px;
                    white-space: nowrap;
                    overflow: hidden; /* 隐藏溢出的文本 */
                    text-overflow: ellipsis; /* 显示省略号 */
                  "
                  >{{ viewDrawer.remark }}</span
                >
              </template>
            </el-popover>
          </el-descriptions-item>
          <el-descriptions-item label="合同附件：">
            <el-table
              border
              :data="viewDrawer.annexUrlList"
              style="margin-top: 10px"
            >
              <el-table-column label="附件" width="330">
                <template #default="scope">
                  <el-popover
                    effect="light"
                    trigger="hover"
                    placement="top"
                    width="auto"
                  >
                    <template #default>
                      <span>{{ scope.row }}</span>
                    </template>
                    <template #reference>
                      <el-button
                        type="primary"
                        style="padding-left: 0px"
                        @click="annexPreview(scope.row)"
                        text
                      >
                        {{ scope.row.substr(scope.row.lastIndexOf('/') + 1) }}
                      </el-button>
                    </template>
                  </el-popover>
                </template>
              </el-table-column>
              <el-table-column label="下载">
                <template #default="scope">
                  <el-button
                    type="primary"
                    icon="Download"
                    @click="download(scope.row)"
                  />
                </template>
              </el-table-column>
            </el-table>
          </el-descriptions-item>
          <el-descriptions-item label="打款截图：">
            <el-image
              style="width: 100px; height: 100px; margin-left: 42px"
              :src="viewDrawer.paymentScreenshot"
              :preview-src-list="viewDrawer.paymentScreenshotList"
              fit="cover"
            >
            </el-image>
          </el-descriptions-item>
        </el-descriptions>
        <ApprovalFlow
          :nodeList="nodeList"
          :approvalStatus="viewDrawer.approvalStatus"
          :auditType="1001"
          :bizId="viewDrawer.id"
          @refresh="approvalFlowRefresh"
        />
      </template>
    </el-drawer>
  </div>

  <div class="drawer">
    <el-drawer v-model="editDrawer" title="重新提交" direction="rtl">
      <el-form
        :model="modifyForm"
        style="margin-top: 20px"
        :rules="insertRules"
        ref="modifyFormRef"
      >
        <el-form-item label="付款时间：" label-width="135" prop="paymentTime">
          <el-date-picker
            v-model="modifyForm.paymentTime"
            type="datetime"
            placeholder="请选择付款时间"
            value-format="yyyy-MM-dd HH:mm:ss"
            style="width: 292.2px"
          />
        </el-form-item>
        <el-form-item
          label="甲方公司名称："
          label-width="135"
          prop="companyName"
        >
          <el-input
            v-model="modifyForm.companyName"
            minlength="8"
            type="text"
            placeholder="请输入甲方公司名称"
            style="width: 292.2px"
          />
        </el-form-item>
        <el-form-item
          label="甲方联系人姓名："
          label-width="135"
          prop="companyContactUserName"
        >
          <el-input
            v-model="modifyForm.companyContactUserName"
            minlength="2"
            type="text"
            placeholder="请输入甲方联系人姓名"
            style="width: 292.2px"
          />
        </el-form-item>
        <el-form-item
          label="甲方联系人电话："
          label-width="135"
          prop="companyContactUserTel"
        >
          <el-input
            v-model="modifyForm.companyContactUserTel"
            minlength="11"
            type="text"
            placeholder="请输入甲方联系人电话"
            style="width: 292.2px"
          />
        </el-form-item>
        <el-form-item label="业务类型：" label-width="135" prop="bizTypeList">
          <el-select
            v-model="modifyForm.bizTypeList"
            placeholder="请选择业务类型"
            style="width: 292.2px"
            multiple
          >
            <el-option label="工商代办" value="0"></el-option>
            <el-option label="代理记账" value="1"></el-option>
            <el-option label="公司注销" value="2"></el-option>
            <el-option label="知识产权" value="3"></el-option>
            <el-option label="项目申报" value="4"></el-option>
            <el-option label="其他" value="5"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="成交金额：" label-width="135" prop="amount">
          <el-input-number
            v-model="modifyForm.amount"
            :precision="2"
            :step="0.1"
            :min="0"
            value-on-clear="min"
            controls-position="right"
            style="width: 292.2px"
          />
        </el-form-item>
        <el-form-item label="备注：" label-width="135" prop="remark">
          <el-input
            v-model="modifyForm.remark"
            :autosize="{ minRows: 2, maxRows: 4 }"
            minlength="1"
            type="textarea"
            placeholder="请输入备注"
            style="width: 292.2px"
          />
        </el-form-item>
        <el-form-item label="合同附件：" label-width="135" prop="annexUrlList">
          <ObsFileUpload
            v-model:modelValue="modifyForm.annexUrlList"
            :limit="3"
            :fileSize="5"
            @filePreview="annexPreview"
          />
        </el-form-item>
        <el-form-item
          label="打款截图："
          label-width="135"
          prop="paymentScreenshotList"
        >
          <ObsImgUpload
            v-model:modelValue="modifyForm.paymentScreenshotList"
            :limit="3"
            :fileSize="5"
            @filePreview="annexPreview"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="closeModifyForm">取消</el-button>
        <el-button type="primary" @click="submitModifyForm(modifyFormRef)"
          >保存</el-button
        >
      </template>
    </el-drawer>
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

  <el-dialog
    v-model="insertDialogVisibleFlag"
    title="保存"
    @close="resetForm('insertFormRef')"
  >
    <el-form :model="insertForm" :rules="insertRules" ref="insertFormRef">
      <el-form-item label="付款时间：" label-width="133.45" prop="paymentTime">
        <el-date-picker
          v-model="insertForm.paymentTime"
          type="datetime"
          placeholder="请选择付款时间"
          value-format="YYYY-MM-DD HH:mm:ss"
          style="width: 292.2px"
        />
      </el-form-item>
      <el-form-item
        label="甲方公司名称："
        label-width="133.45"
        prop="companyName"
      >
        <el-input
          v-model="insertForm.companyName"
          minlength="8"
          type="text"
          placeholder="请输入甲方公司名称"
          style="width: 292.2px"
        />
      </el-form-item>
      <el-form-item label="甲方联系人姓名：" prop="companyContactUserName">
        <el-input
          v-model="insertForm.companyContactUserName"
          minlength="2"
          type="text"
          placeholder="请输入甲方联系人姓名"
          style="width: 292.2px"
        />
      </el-form-item>
      <el-form-item label="甲方联系人电话：" prop="companyContactUserTel">
        <el-input
          v-model="insertForm.companyContactUserTel"
          minlength="11"
          type="text"
          placeholder="请输入甲方联系人电话"
          style="width: 292.2px"
        />
      </el-form-item>
      <el-form-item label="业务类型：" label-width="133.45" prop="bizTypeList">
        <el-select
          v-model="insertForm.bizTypeList"
          placeholder="请选择业务类型"
          multiple
          style="width: 292.2px"
        >
          <el-option label="工商代办" value="0"></el-option>
          <el-option label="代理记账" value="1"></el-option>
          <el-option label="公司注销" value="2"></el-option>
          <el-option label="知识产权" value="3"></el-option>
          <el-option label="项目申报" value="4"></el-option>
          <el-option label="其他" value="3"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="成交金额：" label-width="133.45" prop="amount">
        <el-input-number
          v-model="insertForm.amount"
          :precision="2"
          :step="0.1"
          :min="0"
          :value-on-clear="0"
          controls-position="right"
          style="width: 292.2px"
        />
      </el-form-item>
      <el-form-item label="备注：" label-width="133.45" prop="remark">
        <el-input
          v-model="insertForm.remark"
          :autosize="{ minRows: 2, maxRows: 4 }"
          minlength="1"
          type="textarea"
          placeholder="请输入备注"
          style="width: 500px"
        />
      </el-form-item>
      <el-form-item label="合同附件：" label-width="133.45" prop="annexUrlList">
        <ObsFileUpload
          v-model:modelValue="insertForm.annexUrlList"
          :limit="3"
          :fileSize="5"
          @filePreview="annexPreview"
        />
      </el-form-item>
      <el-form-item
        label="打款截图："
        label-width="133.45"
        prop="paymentScreenshotList"
      >
        <ObsImgUpload
          v-model:modelValue="insertForm.paymentScreenshotList"
          :limit="3"
          :fileSize="5"
          @filePreview="annexPreview"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="closeInsertForm">取消</el-button>
      <el-button type="primary" @click="submitForm(insertFormRef)"
        >保存</el-button
      >
    </template>
  </el-dialog>
</template>

<script setup name="Order">
import { parseTime } from '@/utils/oa'
import pdfObj from 'pdfobject'
import { ElImage } from 'element-plus'
import { checkPermi } from '@/utils/permission'
import adoptPng from '@/assets/images/adopt.png'
import waitPng from '@/assets/images/wait.png'
import refusePng from '@/assets/images/refuse.png'
import revokePng from '@/assets/images/revoke.png'
import returnPng from '@/assets/images/return.png'
import { reactive } from 'vue'
import { pageQuery, save, modify, delOrder } from '@/api/core/businessOrder'

const { proxy } = getCurrentInstance()

const showSearch = ref(true)

const approvalStatusImgMap = reactive({
  1: adoptPng,
  0: waitPng,
  2: refusePng,
  4: revokePng,
  5: returnPng
})

function resetQueryArea() {
  proxy.resetForm('queryFormRef')
  getList()
}

function test() {
  console.log(arguments)
}

const queryFormRef = ref(null)
const queryForm = reactive({
  auditNo: undefined,
  createUser: undefined,
  approvalStatus: undefined,
  companyName: undefined,
  pageNum: 1,
  pageSize: 10
})

const tableRef = ref(null)
function del() {
  proxy.$modal.confirm('确定删除吗？').then(() => {
    var ids = tableRef.value.getSelectionRows().map((x) => x.id)
    if (!ids.length) {
      getList()
      return
    }
    delOrder(tableRef.value.getSelectionRows().map((x) => x.id))
      .then(() => {
        proxy.$message.success('删除成功')
        getList()
      })
      .catch(() => {
        proxy.$message.error('删除失败')
      })
  })
}

const loading = ref(true)
const total = ref(0)
function getList() {
  loading.value = true
  pageQuery(queryForm).then((x) => {
    orderList.value = x.rows.map((x) => {
      x.companyNameShow = hideCompanyName(x)
      x.companyNameVisitFlag = false
      x.companyContactUserNameShow = hideCompanyContactUserName(x)
      x.companyContactUserNameVisitFlag = false
      x.companyContactUserTelShow = hideCompanyContactUserTel(x)
      x.companyContactUserTelVisitFlag = false
      x.bizTypeList = x.itemList
        .map((x) => {
          return x.bizTypeName
        })
        .join(', ')
      return x
    })
    total.value = x.total
    loading.value = false
  })
}
const orderList = ref([])

var insertFormRef = ref(null)
var insertDialogVisibleFlag = ref(false)
var insertForm = ref({
  paymentTime: undefined,
  companyName: undefined,
  companyContactUserName: undefined,
  companyContactUserTel: undefined,
  amount: undefined,
  remark: undefined,
  annexUrlList: undefined,
  paymentScreenshotList: undefined,
  bizTypeList: undefined
})

const insertRules = ref({
  paymentTime: [{ required: true, message: '请选择付款时间', trigger: 'blur' }],
  companyName: [
    { required: true, message: '请输入甲方公司名称', trigger: 'blur' },
    { min: 8, message: '请输入8位以上的甲方公司名称', trigger: 'blur' }
  ],
  companyContactUserName: [
    { required: true, message: '请输入甲方联系人姓名', trigger: 'blur' },
    { min: 2, message: '请输入2位以上的甲方联系人姓名', trigger: 'blur' }
  ],
  companyContactUserTel: [
    { required: true, message: '请输入甲方联系人电话', trigger: 'blur' },
    { min: 11, message: '请输入11位以上的甲方联系人电话', trigger: 'blur' },
    {
      pattern: /^1[3456789]\d{9}$/,
      message: '请输入正确的手机号',
      trigger: 'blur'
    }
  ],
  amount: [
    {
      required: true,
      type: 'number',
      message: '请输入成交金额',
      trigger: 'blur'
    }
  ],
  remark: [{ max: 500, message: '内容长度不能超过500', trigger: 'blur' }],
  annexUrlList: [
    {
      required: true,
      type: 'array',
      message: '请上传合同附件',
      trigger: 'blur'
    }
  ],
  paymentScreenshotList: [
    {
      required: true,
      type: 'array',
      message: '请上传打款截图',
      trigger: 'blur'
    }
  ],
  bizTypeList: [
    {
      required: true,
      type: 'array',
      message: '请选择业务类型',
      trigger: 'blur'
    }
  ]
})

function submitForm(form) {
  if (!form) {
    return
  }
  form.validate((valid) => {
    if (valid) {
      save(insertForm.value).then((response) => {
        proxy.$modal.msgSuccess('新增成功')
        getList()
      })
      closeInsertForm()
    }
  })
}

function closeInsertForm() {
  insertDialogVisibleFlag.value = false
  proxy.resetForm('insertFormRef')
}

function allowEdit(row, index) {
  return (
    row.approvalStatus === 4 ||
    row.approvalStatus === 2 ||
    row.approvalStatus === 5
  )
}

const nodeList = ref([])
var viewDrawer = ref({})
var detailDrawer = ref(false)

function closeDetailDrawer() {
  detailDrawer.value = false
}

var modifyFormRef = ref(null)
var modifyForm = ref({})
var editDrawer = ref(false)
function openEditDrawer() {
  editDrawer.value = true
  modifyForm.value = JSON.parse(JSON.stringify(arguments[0]))
  modifyForm.value.bizTypeList = modifyForm.value.itemList.map((x) => {
    return { label: x.bizTypeName, value: x.bizType }
  })
  modifyForm.value.paymentTime = parseTime(
    new Date(modifyForm.value.paymentTime)
  )
  modifyForm.value.annexUrlList = modifyForm.value.annexUrlList.map((x) => {
    var obj = {}
    obj.name = x.substr(x.lastIndexOf('/') + 1)
    obj.url = x
    obj.response = {
      data: x
    }
    return obj
  })
  modifyForm.value.paymentScreenshotList =
    modifyForm.value.paymentScreenshotList.map((x) => {
      var obj = {}
      obj.name = x.substr(x.lastIndexOf('/') + 1)
      obj.url = x
      obj.response = {
        data: x
      }
      return obj
    })
}

function submitModifyForm(form) {
  if (!form) {
    return
  }
  form.validate((valid) => {
    if (valid) {
      if (typeof modifyForm.value.annexUrlList[0] === 'object') {
        modifyForm.value.annexUrlList = modifyForm.value.annexUrlList.map(
          (x) => {
            return x.response.data
          }
        )
      }
      if (typeof modifyForm.value.paymentScreenshotList[0] === 'object') {
        modifyForm.value.paymentScreenshotList =
          modifyForm.value.paymentScreenshotList.map((x) => {
            return x.response.data
          })
      }
      var method = modify
      if (
        modifyForm.value.approvalStatus === 2 ||
        modifyForm.value.approvalStatus === 4
      ) {
        method = save
      }
      modifyForm.value.bizTypeList = modifyForm.value.bizTypeList.map((x) => {
        return x.value
      })
      method(modifyForm.value).then((response) => {
        proxy.$modal.msgSuccess('修改成功')
        getList()
      })
      closeModifyForm()
    }
  })
}

function closeModifyForm() {
  editDrawer.value = false
  proxy.resetForm('modifyFormRef')
}

function viewCompanyName(row) {
  if (row.companyNameVisitFlag) {
    row.companyNameVisitFlag = !row.companyNameVisitFlag
    row.companyNameShow = hideCompanyName(row)
    return
  }
  row.companyNameVisitFlag = !row.companyNameVisitFlag
  row.companyNameShow = row.companyName
}

function viewCompanyContactUserName(row) {
  if (row.companyContactUserNameVisitFlag) {
    row.companyContactUserNameVisitFlag = !row.companyContactUserNameVisitFlag
    row.companyContactUserNameShow = hideCompanyContactUserName(row)
    return
  }
  row.companyContactUserNameVisitFlag = !row.companyContactUserNameVisitFlag
  row.companyContactUserNameShow = row.companyContactUserName
}

function viewCompanyContactUserTel(row) {
  if (row.companyContactUserTelVisitFlag) {
    row.companyContactUserTelVisitFlag = !row.companyContactUserTelVisitFlag
    row.companyContactUserTelShow = hideCompanyContactUserTel(row)
    return
  }
  row.companyContactUserTelVisitFlag = !row.companyContactUserTelVisitFlag
  row.companyContactUserTelShow = row.companyContactUserTel
}

function download(targetUrl) {
  window.location = targetUrl
}

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

function approvalFlowRefresh() {
  closeModifyForm()
  closeDetailDrawer()
  getList()
}

getList()
</script>

<script>
function hideCompanyName(dest) {
  return (
    dest.companyName.substr(0, 2) +
    (function () {
      let str = ''
      let hideLength = dest.companyName.length - 4
      for (let i = 0; i < hideLength; i++) {
        str += '*'
      }
      return str
    })() +
    dest.companyName.substr(-2, 2)
  )
}

function hideCompanyContactUserName(dest) {
  if (dest.companyContactUserName.length <= 3) {
    return (
      dest.companyContactUserName.substr(0, 1) +
      Array.prototype.map
        .call(dest.companyContactUserName.substr(1), () => '*')
        .join('')
    )
  }
  return (
    dest.companyContactUserName.substr(0, 2) +
    Array.prototype.map
      .call(dest.companyContactUserName.substr(2), () => '*')
      .join('')
  )
}

function hideCompanyContactUserTel(dest) {
  return (
    dest.companyContactUserTel.substr(0, 3) +
    '****' +
    dest.companyContactUserTel.substr(-4)
  )
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