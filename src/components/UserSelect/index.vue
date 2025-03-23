<template>
  <el-select
    :placeholder="placeholder"
    :style="style"
    :filterable="filterable"
    :clearable="clearable"
    v-model="userSelectModel"
    @change="handleChange"
  >
    <el-option
      v-for="item in internalUserList"
      :key="item.userId"
      :label="item.nickName"
      :value="item.userId"
    />
  </el-select>
</template>

<script setup>
import { listUser } from '@/api/system/user'
const userSelectModel = defineModel('userSelectModel')

const props = defineProps({
  userList: {
    type: Array,
    default: () => []
  },
  placeholder: {
    type: String,
    default: '请选择提交人'
  },
  // 控制组件宽度
  style: {
    type: Object,
    default: () => ({ width: '240px' })
  },
  // 是否可以过滤
  filterable: {
    type: Boolean,
    default: true
  },
  // 是否可以清空选择
  clearable: {
    type: Boolean,
    default: true
  }
})

const internalUserList = ref(props.userList || [])

const emit = defineEmits(['userSelectChange'])
const handleChange = (value) => {
  emit('userSelectChange', value)
}

onBeforeMount(() => {
  if (internalUserList.value.length === 0) {
    listUser({
      pageNum: 1,
      pageSize: 9999
    })
      .then((x) => (internalUserList.value = x.rows))
      .catch((err) => {
        console.log(err)
      })
  }
})
</script>