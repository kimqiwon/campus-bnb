import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/home' },
  {
    path: '/',
    component: () => import('../views/Layout.vue'),
    children: [
      { path: 'home', name: 'Home', component: () => import('../views/Home.vue'), meta: { title: '首页' } },
      { path: 'rooms', name: 'RoomList', component: () => import('../views/RoomList.vue'), meta: { title: '房源浏览' } },
      { path: 'rooms/:id', name: 'RoomDetail', component: () => import('../views/RoomDetail.vue'), meta: { title: '房间详情' } },
      { path: 'my-bookings', name: 'MyBookings', component: () => import('../views/MyBookings.vue'), meta: { title: '我的预订', auth: true } },
      { path: 'admin/rooms', name: 'RoomManage', component: () => import('../views/RoomManage.vue'), meta: { title: '房源管理', auth: true, admin: true } },
      { path: 'admin/bookings', name: 'BookingManage', component: () => import('../views/BookingManage.vue'), meta: { title: '预订管理', auth: true, admin: true } },
      { path: 'admin/settlements', name: 'SettlementManage', component: () => import('../views/SettlementManage.vue'), meta: { title: '结算管理', auth: true, admin: true } },
      { path: 'admin/dashboard', name: 'Dashboard', component: () => import('../views/Dashboard.vue'), meta: { title: '数据仪表盘', auth: true, admin: true } }
    ]
  },
  { path: '/login', name: 'Login', component: () => import('../views/Login.vue'), meta: { title: '登录' } },
  { path: '/register', name: 'Register', component: () => import('../views/Register.vue'), meta: { title: '注册' } },
  { path: '/:pathMatch(.*)*', component: () => import('../views/NotFound.vue'), meta: { title: '404' } }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - 民宿预订` : '民宿预订管理系统'
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || 'null')

  if (to.meta.auth && !token) {
    return next('/login')
  }
  if (to.meta.admin && user?.role !== 'admin') {
    return next('/home')
  }
  next()
})

export default router
