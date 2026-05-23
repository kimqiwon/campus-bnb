<template>
  <div class="home">
    <div class="hero">
      <h1>🏡 民宿预订管理系统</h1>
      <p>轻松管理民宿房源，便捷提交预订订单</p>
      <div class="hero-actions">
        <el-button type="primary" size="large" @click="$router.push('/rooms')">浏览房源</el-button>
        <el-button v-if="!userStore.isLoggedIn" size="large" @click="$router.push('/register')">立即注册</el-button>
        <el-button v-if="userStore.isAdmin" type="success" size="large" @click="$router.push('/admin/dashboard')">管理后台</el-button>
      </div>
    </div>
    <div class="features">
      <el-row :gutter="30">
        <el-col :span="6" v-for="f in features" :key="f.title">
          <el-card shadow="hover" class="feature-card" @click="handleFeatureClick(f.key)">
            <div class="feature-icon">{{ f.icon }}</div>
            <h3>{{ f.title }}</h3>
            <p>{{ f.desc }}</p>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useUserStore } from '../store/user'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()

const features = [
  { key: 'tenant', icon: '🔑', title: '租客管理', desc: '注册登录，查看个人信息与预订记录' },
  { key: 'room', icon: '🏠', title: '房源管控', desc: '录入房间信息，实时管控房型状态' },
  { key: 'booking', icon: '📅', title: '在线预订', desc: '选择房间与日期，一键提交预订订单' },
  { key: 'settlement', icon: '💰', title: '费用结算', desc: '自动核算费用，订单核销归档管理' }
]

function handleFeatureClick(key) {
  if (key === 'tenant') {
    if (!userStore.isLoggedIn) {
      router.push('/login')
    } else if (userStore.isAdmin) {
      router.push('/admin/bookings')
    } else {
      router.push('/my-bookings')
    }
  } else if (key === 'room') {
    if (userStore.isAdmin) {
      router.push('/admin/rooms')
    } else {
      router.push('/rooms')
    }
  } else if (key === 'booking') {
    if (!userStore.isLoggedIn) {
      router.push('/login')
    } else {
      router.push('/rooms')
    }
  } else if (key === 'settlement') {
    if (!userStore.isLoggedIn) {
      router.push('/login')
    } else if (!userStore.isAdmin) {
      ElMessage.warning('仅管理员可访问结算管理')
    } else {
      router.push('/admin/settlements')
    }
  }
}
</script>

<style scoped>
.hero {
  text-align: center;
  padding: 60px 20px;
  background: linear-gradient(135deg, #409eff 0%, #67c23a 100%);
  color: #fff;
  border-radius: 12px;
  margin-bottom: 40px;
}
.hero h1 { font-size: 36px; margin-bottom: 12px; }
.hero p { font-size: 16px; opacity: 0.9; margin-bottom: 24px; }
.hero-actions { display: flex; gap: 15px; justify-content: center; }
.features { padding: 0 40px; }
.feature-card { text-align: center; padding: 20px 10px; height: 100%; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; }
.feature-card:hover { transform: translateY(-4px); box-shadow: 0 8px 25px rgba(0,0,0,0.12); }
.feature-icon { font-size: 40px; margin-bottom: 12px; }
.feature-card h3 { margin-bottom: 8px; color: #303133; }
.feature-card p { color: #909399; font-size: 13px; line-height: 1.6; }
</style>
