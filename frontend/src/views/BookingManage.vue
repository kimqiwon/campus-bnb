<template>
  <div class="booking-manage">
    <h2>📅 预订管理</h2>
    <el-table :data="list" v-loading="loading" border stripe>
      <el-table-column prop="id" label="编号" width="60" />
      <el-table-column prop="tenant_name" label="租客" width="100" />
      <el-table-column prop="tenant_phone" label="电话" width="130" />
      <el-table-column prop="room_title" label="房间" />
      <el-table-column label="房型" width="90">
        <template #default="{ row }">{{ typeLabel(row.room_type) }}</template>
      </el-table-column>
      <el-table-column prop="check_in" label="入住" width="110" />
      <el-table-column prop="check_out" label="退房" width="110" />
      <el-table-column prop="nights" label="晚" width="50" />
      <el-table-column label="总价" width="90">
        <template #default="{ row }">¥{{ row.total_price }}</template>
      </el-table-column>
      <el-table-column label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="statusTag(row.status)">{{ statusLabel(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button v-if="row.status === 'pending'" type="success" size="small" @click="handleConfirm(row.id)">确认</el-button>
          <el-button v-if="row.status === 'pending' || row.status === 'confirmed'" type="danger" size="small" @click="handleCancel(row.id)">取消</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-empty v-if="!loading && list.length === 0" description="暂无预订" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { bookingApi } from '../api'

const loading = ref(false)
const list = ref([])

const typeMap = { single: '单人间', double: '双人间', suite: '套房' }
const statusMap = { pending: '待确认', confirmed: '已确认', cancelled: '已取消', completed: '已完成' }
function typeLabel(v) { return typeMap[v] || v }
function statusLabel(v) { return statusMap[v] || v }
function statusTag(v) {
  return v === 'pending' ? 'warning' : v === 'confirmed' ? 'success' : v === 'cancelled' ? 'info' : 'success'
}

async function fetchData() {
  loading.value = true
  try {
    const res = await bookingApi.getList({ pageSize: 100 })
    list.value = res.data.list
  } catch {} finally { loading.value = false }
}

async function handleConfirm(id) {
  try {
    await bookingApi.confirm(id)
    ElMessage.success('预订已确认，结算记录已生成')
    fetchData()
  } catch {}
}

async function handleCancel(id) {
  await ElMessageBox.confirm('确定取消此预订吗？', '提示', { type: 'warning' })
  try {
    await bookingApi.cancel(id)
    ElMessage.success('已取消')
    fetchData()
  } catch {}
}

onMounted(fetchData)
</script>

<style scoped>
.booking-manage h2 { margin-bottom: 16px; }
</style>
