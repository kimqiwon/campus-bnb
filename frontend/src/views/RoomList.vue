<template>
  <div class="room-list">
    <h2>🏠 房源列表</h2>
    <!-- 筛选条件 -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="filter">
        <el-form-item label="房型">
          <el-select v-model="filter.room_type" clearable placeholder="全部">
            <el-option label="单人间" value="single" />
            <el-option label="双人间" value="double" />
            <el-option label="套房" value="suite" />
          </el-select>
        </el-form-item>
        <el-form-item label="价格区间">
          <el-input-number v-model="filter.min_price" :min="0" placeholder="最低" style="width:120px" />
          <span style="margin:0 8px">-</span>
          <el-input-number v-model="filter.max_price" :min="0" placeholder="最高" style="width:120px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchRooms">搜索</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 房间列表 -->
    <el-row :gutter="20" v-loading="loading">
      <el-col :span="8" v-for="room in roomList" :key="room.id" style="margin-bottom:20px">
        <el-card shadow="hover" class="room-card" @click="$router.push(`/rooms/${room.id}`)">
          <img :src="room.image_url || 'https://picsum.photos/400/300'" class="room-img" />
          <div class="room-info">
            <h3>{{ room.title }}</h3>
            <el-tag :type="typeTag(room.room_type)" size="small">{{ typeLabel(room.room_type) }}</el-tag>
            <el-tag :type="statusTag(room.status)" size="small" style="margin-left:6px">{{ statusLabel(room.status) }}</el-tag>
            <p class="price">¥{{ room.price }} <span>/晚</span></p>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-empty v-if="!loading && roomList.length === 0" description="暂无房源" />

    <!-- 分页 -->
    <el-pagination
      v-if="total > 0"
      v-model:current-page="filter.page"
      :page-size="filter.pageSize"
      :total="total"
      layout="total, prev, pager, next"
      @current-change="fetchRooms"
      style="margin-top:20px;justify-content:center"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { roomApi } from '../api'

const loading = ref(false)
const roomList = ref([])
const total = ref(0)

const filter = reactive({
  room_type: '',
  min_price: null,
  max_price: null,
  page: 1,
  pageSize: 9
})

const typeMap = { single: '单人间', double: '双人间', suite: '套房' }
const statusMap = { available: '空闲', booked: '已预订', maintenance: '维护中' }
function typeLabel(v) { return typeMap[v] || v }
function typeTag(v) { return v === 'suite' ? 'warning' : v === 'double' ? 'success' : 'info' }
function statusTag(v) { return v === 'available' ? 'success' : v === 'booked' ? 'danger' : 'info' }
function statusLabel(v) { return statusMap[v] || v }

async function fetchRooms() {
  loading.value = true
  try {
    const params = { ...filter, status: 'available' }
    // 过滤空值
    Object.keys(params).forEach(k => { if (params[k] === '' || params[k] === null) delete params[k] })
    const res = await roomApi.getList(params)
    roomList.value = res.data.list
    total.value = res.data.total
  } catch {} finally { loading.value = false }
}

function resetFilter() {
  filter.room_type = ''
  filter.min_price = null
  filter.max_price = null
  filter.page = 1
  fetchRooms()
}

onMounted(fetchRooms)
</script>

<style scoped>
.room-list h2 { margin-bottom: 16px; }
.filter-card { margin-bottom: 20px; }
.room-card { cursor: pointer; transition: transform .2s; }
.room-card:hover { transform: translateY(-3px); }
.room-img { width: 100%; height: 180px; object-fit: cover; border-radius: 6px; }
.room-info { padding-top: 10px; }
.room-info h3 { font-size: 16px; margin-bottom: 8px; }
.price { color: #f56c6c; font-size: 20px; font-weight: bold; margin-top: 8px; }
.price span { font-size: 13px; color: #909399; font-weight: normal; }
</style>
