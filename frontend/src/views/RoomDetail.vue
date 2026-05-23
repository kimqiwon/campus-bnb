<template>
  <div class="room-detail" v-loading="loading">
    <el-button @click="$router.back()" style="margin-bottom:16px">← 返回</el-button>
    <el-row :gutter="30" v-if="room">
      <el-col :span="12">
        <img :src="room.image_url || 'https://picsum.photos/600/400'" class="detail-img" />
      </el-col>
      <el-col :span="12">
        <h2>{{ room.title }}</h2>
        <el-tag :type="typeTag(room.room_type)">{{ typeLabel(room.room_type) }}</el-tag>
        <el-tag :type="statusTag(room.status)" style="margin-left:8px">{{ statusLabel(room.status) }}</el-tag>
        <p class="detail-price">¥{{ room.price }} <span>/晚</span></p>
        <p class="detail-desc">{{ room.description || '暂无描述' }}</p>

        <!-- 预订表单（仅登录租客可见） -->
        <el-card v-if="userStore.isLoggedIn && !userStore.isAdmin && room.status === 'available'" class="booking-form">
          <h4>📅 预订此房间</h4>
          <el-form :model="bookingForm">
            <el-form-item label="入住日期">
              <el-date-picker v-model="bookingForm.check_in" type="date" placeholder="选择入住日期"
                :disabled-date="disabledDate" value-format="YYYY-MM-DD" style="width:100%" />
            </el-form-item>
            <el-form-item label="退房日期">
              <el-date-picker v-model="bookingForm.check_out" type="date" placeholder="选择退房日期"
                :disabled-date="disabledDate" value-format="YYYY-MM-DD" style="width:100%" />
            </el-form-item>
            <el-form-item v-if="totalNights > 0">
              <p>共 <b>{{ totalNights }}</b> 晚，总价：<b style="color:#f56c6c;font-size:20px">¥{{ totalPrice }}</b></p>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleBooking" :loading="booking">提交预订</el-button>
            </el-form-item>
          </el-form>
        </el-card>
        <el-alert v-else-if="!userStore.isLoggedIn" title="请先登录后再预订" type="info" show-icon :closable="false" style="margin-top:16px">
          <template #default>
            <el-button type="primary" size="small" @click="$router.push('/login')">去登录</el-button>
          </template>
        </el-alert>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { roomApi, bookingApi } from '../api'
import { useUserStore } from '../store/user'

const route = useRoute()
const userStore = useUserStore()
const loading = ref(false)
const room = ref(null)
const booking = ref(false)

const bookingForm = reactive({ check_in: '', check_out: '' })

const typeMap = { single: '单人间', double: '双人间', suite: '套房' }
const statusMap = { available: '空闲', booked: '已预订', maintenance: '维护中' }
function typeLabel(v) { return typeMap[v] || v }
function typeTag(v) { return v === 'suite' ? 'warning' : v === 'double' ? 'success' : 'info' }
function statusTag(v) { return v === 'available' ? 'success' : v === 'booked' ? 'danger' : 'info' }
function statusLabel(v) { return statusMap[v] || v }

const totalNights = computed(() => {
  if (!bookingForm.check_in || !bookingForm.check_out) return 0
  return Math.ceil((new Date(bookingForm.check_out) - new Date(bookingForm.check_in)) / (1000 * 60 * 60 * 24))
})
const totalPrice = computed(() => totalNights.value * (room.value?.price || 0))

function disabledDate(time) {
  return time.getTime() < Date.now() - 24 * 60 * 60 * 1000
}

async function fetchRoom() {
  loading.value = true
  try {
    const res = await roomApi.getDetail(route.params.id)
    room.value = res.data
  } catch {} finally { loading.value = false }
}

async function handleBooking() {
  if (!bookingForm.check_in || !bookingForm.check_out) {
    return ElMessage.warning('请选择入住和退房日期')
  }
  if (totalNights.value <= 0) {
    return ElMessage.warning('退房日期必须晚于入住日期')
  }
  booking.value = true
  try {
    await bookingApi.create({ room_id: room.value.id, ...bookingForm })
    ElMessage.success('预订成功！等待管理员确认')
    bookingForm.check_in = ''
    bookingForm.check_out = ''
    fetchRoom()
  } catch {} finally { booking.value = false }
}

onMounted(fetchRoom)
</script>

<style scoped>
.detail-img { width: 100%; border-radius: 10px; }
.detail-price { color: #f56c6c; font-size: 28px; font-weight: bold; margin: 16px 0; }
.detail-price span { font-size: 14px; color: #909399; font-weight: normal; }
.detail-desc { color: #606266; line-height: 1.8; margin-bottom: 16px; }
.booking-form { margin-top: 20px; }
.booking-form h4 { margin-bottom: 12px; }
</style>
