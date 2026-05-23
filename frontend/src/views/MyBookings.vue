<template>
  <div class="my-bookings">
    <h2>📋 我的预订</h2>
    <el-table :data="list" v-loading="loading" border stripe>
      <el-table-column prop="id" label="预订编号" width="80" />
      <el-table-column prop="room_title" label="房间" />
      <el-table-column label="房型" width="100">
        <template #default="{ row }">
          <el-tag size="small">{{ typeLabel(row.room_type) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="check_in" label="入住日期" width="120" />
      <el-table-column prop="check_out" label="退房日期" width="120" />
      <el-table-column prop="nights" label="天数" width="60" />
      <el-table-column label="总价" width="100">
        <template #default="{ row }">¥{{ row.total_price }}</template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="statusTag(row.status)">{{ statusLabel(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120">
        <template #default="{ row }">
          <el-button
            v-if="row.status === 'pending' || row.status === 'confirmed'"
            type="danger" size="small"
            @click="handleCancel(row.id)"
          >取消</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-empty v-if="!loading && list.length === 0" description="暂无预订记录" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { tenantApi, bookingApi } from '../api'

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
    const res = await tenantApi.getMyBookings()
    list.value = res.data.list
  } catch {} finally { loading.value = false }
}

async function handleCancel(id) {
  await ElMessageBox.confirm('确定取消此预订吗？', '提示', { type: 'warning' })
  try {
    await bookingApi.cancel(id)
    ElMessage.success('预订已取消')
    fetchData()
  } catch {}
}

onMounted(fetchData)
</script>

<style scoped>
.my-bookings h2 { margin-bottom: 16px; }
</style>
