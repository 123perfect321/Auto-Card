<template>
  <div class="page-categories">
    <el-card shadow="never">
      <template #header>
        <div class="page-header">
          <h3>分类管理</h3>
          <el-button type="primary" @click="openDialog()">新增分类</el-button>
        </div>
      </template>

      <el-table :data="categories">
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="icon" label="图标" width="60" />
        <el-table-column prop="name" label="名称" />
        <el-table-column prop="sort" label="排序" width="80" />
        <el-table-column prop="productCount" label="商品数" width="90" />
        <el-table-column label="操作" width="160">
          <template #default="{ row }">
            <el-button link @click="openDialog(row)">编辑</el-button>
            <el-popconfirm title="确定删除?" @confirm="handleDelete(row.id)">
              <template #reference>
                <el-button link type="danger">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="editId ? '编辑分类' : '新增分类'" width="400px">
      <el-form :model="form" label-width="60px">
        <el-form-item label="名称"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="图标"><el-input v-model="form.icon" placeholder="emoji" /></el-form-item>
        <el-form-item label="排序"><el-input-number v-model="form.sort" :min="0" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave" :loading="saving">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/api'
import { ElMessage } from 'element-plus'

const categories = ref<any[]>([])
const dialogVisible = ref(false)
const editId = ref<number | null>(null)
const saving = ref(false)
const form = reactive({ name: '', icon: '', sort: 0 })

onMounted(() => loadCategories())

async function loadCategories() {
  try {
    const result = await getCategories() as any
    categories.value = result
  } catch (e) { console.error(e) }
}

function openDialog(cat?: any) {
  if (cat) {
    editId.value = cat.id
    form.name = cat.name; form.icon = cat.icon; form.sort = cat.sort
  } else {
    editId.value = null
    form.name = ''; form.icon = ''; form.sort = 0
  }
  dialogVisible.value = true
}

async function handleSave() {
  saving.value = true
  try {
    if (editId.value) {
      await updateCategory(editId.value, form)
    } else {
      await createCategory(form)
    }
    ElMessage.success('保存成功')
    dialogVisible.value = false
    loadCategories()
  } catch (e) { console.error(e) } finally { saving.value = false }
}

async function handleDelete(id: number) {
  try {
    await deleteCategory(id)
    ElMessage.success('删除成功')
    loadCategories()
  } catch (e) { console.error(e) }
}
</script>
