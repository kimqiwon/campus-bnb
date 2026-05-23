<template>
  <div class="dashboard">
    <h2>📊 数据仪表盘</h2>
    <el-row :gutter="20" v-loading="loading">
      <el-col :span="6" v-for="card in cards" :key="card.label">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-value" :style="{ color: card.color }">{{ card.value }}</div>
          <div class="stat-label">{{ card.label }}</div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { settlementApi } from '../api'

const loading = ref(false)
const stats = ref({ total_settlements: 0, total_amount: 0, paid_count: 0, paid_amount: 0, cancel_count: 0 })

const cards = computed(() => [
  { label: '总结算数', value: stats.value.total_settlements, color: '#409eff' },
  { label: '总金额 (元)', value: '¥' + Number(stats.value.total_amount).toFixed(2), color: '#67c23a' },
  { label: '已支付数', value: stats.value.paid_count, color: '#e6a23c' },
  { label: '取消订单数', value: stats.value.cancel_count, color: '#f56c6c' }
])

async function fetchData() {
  loading.value = true
  try {
    const res = await settlementApi.getStats()
    stats.value = res.data
  } catch {} finally { loading.value = false }
}

onMounted(fetchData)
</script>

<style scoped>
.dashboard h2 { margin-bottom: 20px; }
.stat-card { text-align: center; padding: 20px 10px; }
.stat-value { font-size: 32px; font-weight: bold; margin-bottom: 8px; }
.stat-label { color: #909399; font-size: 14px; }
</style>
