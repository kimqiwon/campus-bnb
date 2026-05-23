<template>
  <div class="room-manage">
    <div class="page-header">
      <h2>🏠 房源管理</h2>
      <el-button type="primary" @click="showAddDialog">+ 添加房间</el-button>
    </div>

    <el-table :data="list" v-loading="loading" border stripe>
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="title" label="标题" />
      <el-table-column label="房型" width="100">
        <template #default="{ row }">{{ typeLabel(row.room_type) }}</template>
      </el-table-column>
      <el-table-column label="价格" width="100">
        <template #default="{ row }">¥{{ row.price }}/晚</template>
      </el-table-column>
      <el-table-column label="状态" width="110">
        <template #default="{ row }">
          <el-tag :type="statusTag(row.status)">{{ statusLabel(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="300">
        <template #default="{ row }">
          <el-button size="small" @click="showEditDialog(row)">编辑</el-button>
          <el-select
            :model-value="row.status"
            @change="(val) => handleStatusChange(row.id, val)"
            size="small"
            style="width:100px;margin-left:6px"
          >
            <el-option label="空闲" value="available" />
            <el-option label="维护中" value="maintenance" />
          </el-select>
          <el-button size="small" type="danger" @click="handleDelete(row.id)" style="margin-left:6px">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑房间' : '添加房间'" width="500px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="标题">
          <el-input v-model="form.title" placeholder="如：山水大床房" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="价格(元/晚)">
          <el-input-number v-model="form.price" :min="0" :precision="2" style="width:100%" />
        </el-form-item>
        <el-form-item label="房型">
          <el-select v-model="form.room_type" style="width:100%">
            <el-option label="单人间" value="single" />
            <el-option label="双人间" value="double" />
            <el-option label="套房" value="suite" />
          </el-select>
        </el-form-item>
        <el-form-item label="图片URL">
          <el-input v-model="form.image_url" placeholder="可选，图片链接" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave" :loading="saving">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { roomApi } from '../api'

const loading = ref(false)
const saving = ref(false)
const list = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const editId = ref(null)

const form = reactive({ title: '', description: '', price: 100, room_type: 'single', image_url: '' })

const typeMap = { single: '单人间', double: '双人间', suite: '套房' }
const statusMap = { available: '空闲', booked: '已预订', maintenance: '维护中' }
function typeLabel(v) { return typeMap[v] || v }
function statusLabel(v) { return statusMap[v] || v }
function statusTag(v) { return v === 'available' ? 'success' : v === 'booked' ? 'danger' : 'info' }

async function fetchData() {
  loading.value = true
  try {
    const res = await roomApi.getList({ pageSize: 100 })
    list.value = res.data.list
  } catch {} finally { loading.value = false }
}

function showAddDialog() {
  isEdit.value = false; editId.value = null
  Object.assign(form, { title: '', description: '', price: 100, room_type: 'single', image_url: '' })
  dialogVisible.value = true
}

function showEditDialog(row) {
  isEdit.value = true; editId.value = row.id
  Object.assign(form, { title: row.title, description: row.description, price: row.price, room_type: row.room_type, image_url: row.image_url })
  dialogVisible.value = true
}

async function handleSave() {
  saving.value = true
  try {
    if (isEdit.value) {
      await roomApi.update(editId.value, form)
      ElMessage.success('更新成功')
    } else {
      await roomApi.add(form)
      ElMessage.success('添加成功')
    }
    dialogVisible.value = false
    fetchData()
  } catch {} finally { saving.value = false }
}

async function handleStatusChange(id, status) {
  try {
    await roomApi.updateStatus(id, status)
    ElMessage.success('状态已更新')
    fetchData()
  } catch {}
}

async function handleDelete(id) {
  await ElMessageBox.confirm('确定删除此房间吗？', '警告', { type: 'warning' })
  try {
    await roomApi.delete(id)
    ElMessage.success('删除成功')
    fetchData()
  } catch {}
}

onMounted(fetchData)
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
</style>
