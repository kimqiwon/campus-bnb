<template>
  <el-container class="layout">
    <el-header class="header">
      <div class="logo" @click="$router.push('/')">
        <span>🏡 民宿预订管理系统</span>
      </div>
      <el-menu
        mode="horizontal"
        :default-active="activeMenu"
        router
        class="nav-menu"
        background-color="#409eff"
        text-color="#fff"
        active-text-color="#ffd04b"
      >
        <el-menu-item index="/home">首页</el-menu-item>
        <el-menu-item index="/rooms">浏览房源</el-menu-item>
        <el-menu-item v-if="userStore.isLoggedIn && !userStore.isAdmin" index="/my-bookings">我的预订</el-menu-item>
        <el-sub-menu v-if="userStore.isAdmin" index="admin" title="管理">
          <el-menu-item index="/admin/dashboard">数据仪表盘</el-menu-item>
          <el-menu-item index="/admin/rooms">房源管理</el-menu-item>
          <el-menu-item index="/admin/bookings">预订管理</el-menu-item>
          <el-menu-item index="/admin/settlements">结算管理</el-menu-item>
        </el-sub-menu>
      </el-menu>
      <div class="user-area">
        <template v-if="userStore.isLoggedIn">
          <span class="welcome">👤 {{ userStore.userName }}</span>
          <el-button type="warning" size="small" @click="handleLogout">退出</el-button>
        </template>
        <template v-else>
          <el-button type="success" size="small" @click="$router.push('/login')">登录</el-button>
          <el-button type="info" size="small" @click="$router.push('/register')">注册</el-button>
        </template>
      </div>
    </el-header>
    <el-main>
      <router-view />
    </el-main>
    <el-footer class="footer">
      <span>© 2026 日常民宿预订管理系统 | 结对编程作业</span>
    </el-footer>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '../store/user'
import { ElMessage } from 'element-plus'

const route = useRoute()
const userStore = useUserStore()

const activeMenu = computed(() => {
  if (route.path.startsWith('/admin')) return 'admin'
  return route.path
})

function handleLogout() {
  userStore.logout()
  ElMessage.success('已退出登录')
}
</script>

<style scoped>
.layout { min-height: 100vh; }
.header {
  display: flex;
  align-items: center;
  background: #409eff;
  padding: 0 20px;
  height: 60px;
}
.logo {
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  white-space: nowrap;
  margin-right: 30px;
}
.nav-menu { flex: 1; border-bottom: none; }
.user-area { display: flex; align-items: center; gap: 10px; }
.welcome { color: #fff; font-size: 14px; }
.footer {
  text-align: center;
  background: #f5f5f5;
  color: #999;
  font-size: 13px;
  line-height: 50px;
}
</style>
