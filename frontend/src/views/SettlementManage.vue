<template>
  <div class="settlement-manage">
    <h2>💰 结算管理</h2>
    <el-table :data="list" v-loading="loading" border stripe>
      <el-table-column prop="id" label="结算编号" width="80" />
      <el-table-column prop="booking_id" label="预订编号" width="80" />
      <el-table-column prop="tenant_name" label="租客" width="100" />
      <el-table-column prop="room_title" label="房间" />
      <el-table-column prop="check_in" label="入住" width="110" />
      <el-table-column prop="check_out" label="退房" width="110" />
      <el-table-column prop="nights" label="晚" width="50" />
      <el-table-column label="金额" width="100">
        <template #default="{ row }">¥{{ row.amount }}</template>
      </el-table-column>
      <el-table-column label="支付状态" width="110">
        <template #default="{ row }">
          <el-tag :type="row.payment_status === 'paid' ? 'success' : 'warning'">
            {{ row.payment_status === 'paid' ? '已支付' : '未支付' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button
            v-if="row.payment_status === 'unpaid'"
            type="primary" size="small"
            @click="handlePay(row.id)"
          >标记支付</el-button>
          <el-button
            type="success" size="small"
            @click="handleComplete(row.id)"
          >核销归档</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-empty v-if="!loading && list.length === 0" description="暂无结算记录" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { settlementApi } from '../api'

const loading = ref(false)
const list = ref([])

async function fetchData() {
  loading.value = true
  try {
    const res = await settlementApi.getList({ pageSize: 100 })
    list.value = res.data.list
  } catch {} finally { loading.value = false }
}

async function handlePay(id) {
  try {
    await settlementApi.markPaid(id)
    ElMessage.success('已标记为已支付')
    fetchData()
  } catch {}
}

async function handleComplete(id) {
  await ElMessageBox.confirm('核销后订单将归档，房间恢复空闲。确定吗？', '提示', { type: 'warning' })
  try {
    await settlementApi.complete(id)
    ElMessage.success('核销完成，房间已恢复空闲')
    fetchData()
  } catch {}
}

onMounted(fetchData)
</script>

<style scoped>
.settlement-manage h2 { margin-bottom: 16px; }
</style>
