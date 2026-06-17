<template>
  <div class="page-products">
    <el-card shadow="never">
      <template #header>
        <div class="page-header">
          <h3>商品管理</h3>
          <el-button type="primary" @click="openDialog()">新增商品</el-button>
        </div>
      </template>

      <div class="filter-bar">
        <el-input v-model="filters.keyword" placeholder="搜索商品" clearable style="width: 200px" />
        <el-select v-model="filters.category_id" placeholder="分类" clearable style="width: 150px">
          <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" />
        </el-select>
        <el-select v-model="filters.status" placeholder="状态" clearable style="width: 120px">
          <el-option label="上架" :value="1" />
          <el-option label="下架" :value="0" />
        </el-select>
        <el-button @click="loadProducts">搜索</el-button>
      </div>

      <el-table :data="products">
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="name" label="商品名" />
        <el-table-column label="价格">
          <template #default="{ row }">¥{{ row.minPrice }} - ¥{{ row.maxPrice }}</template>
        </el-table-column>
        <el-table-column prop="viewCount" label="浏览量" width="90" />
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">{{ row.status === 1 ? '上架' : '下架' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button link @click="openCardDrawer(row)">卡密管理</el-button>
            <el-button link @click="openDialog(row)">编辑</el-button>
            <el-button link @click="handleToggle(row)">{{ row.status === 1 ? '下架' : '上架' }}</el-button>
            <el-popconfirm title="确定删除?" @confirm="handleDelete(row.id)">
              <template #reference>
                <el-button link type="danger">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        class="pagination"
        v-model:current-page="page"
        :page-size="20"
        :total="total"
        layout="total, prev, pager, next"
        @current-change="loadProducts"
      />
    </el-card>

    <el-drawer v-model="cardDrawerVisible" title="卡密管理" size="520px">
      <div v-if="cardProduct" class="card-mgmt">
        <h4>{{ cardProduct.name }}</h4>
        <div v-for="spec in cardProduct.specs" :key="spec.id" class="spec-card-row">
          <div class="spec-info">
            <span class="spec-name">{{ spec.name }}</span>
            <el-tag size="small">库存 {{ spec.stock }}</el-tag>
          </div>
          <div class="spec-actions">
            <el-button size="small" @click="startImport(spec)">导入</el-button>
            <el-popconfirm title="确定清空该规格所有可用卡密？" @confirm="handleClearSpec(spec.id)">
              <template #reference>
                <el-button size="small" type="danger">清空</el-button>
              </template>
            </el-popconfirm>
          </div>
        </div>
        <el-divider />
        <el-popconfirm title="确定清空该商品所有规格的可用卡密？" @confirm="handleClearProduct">
          <template #reference>
            <el-button type="danger" size="small">清空全部卡密</el-button>
          </template>
        </el-popconfirm>
      </div>

      <div v-if="importSpec" class="import-section">
        <h4>导入卡密 → {{ importSpec.name }}</h4>
        <el-input
          v-model="importText"
          type="textarea"
          :rows="8"
          placeholder="每行一个卡密，例如：&#10;NFLX-A3B2-C7D1-E9F4&#10;SPOT-X1Y2-Z3W4-V5U6"
          style="margin: 8px 0"
        />
        <div style="display: flex; gap: 8px;">
          <el-button type="primary" @click="handleImport" :loading="importing">确认导入</el-button>
          <el-button @click="importSpec = null">取消</el-button>
        </div>
      </div>
    </el-drawer>

    <el-dialog v-model="dialogVisible" :title="editId ? '编辑商品' : '新增商品'" width="600px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="商品名">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="form.categoryId">
            <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="封面图">
          <div class="cover-upload">
            <div v-if="form.cover" class="cover-preview">
              <img :src="form.cover" alt="封面" />
              <el-button size="small" type="danger" class="cover-remove" @click="form.cover = ''">
                <i class="fas fa-times"></i>
              </el-button>
            </div>
            <el-upload
              v-else
              action=""
              :auto-upload="false"
              :show-file-list="false"
              accept="image/*"
              :on-change="handleCoverChange"
              :disabled="uploading"
            >
              <div class="cover-upload-btn">
                <i :class="uploading ? 'el-icon-loading' : 'fas fa-cloud-upload-alt'"></i>
                <span>{{ uploading ? '上传中...' : '上传封面' }}</span>
              </div>
            </el-upload>
          </div>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="规格">
          <div class="spec-list">
            <div v-for="(spec, idx) in form.specs" :key="idx" class="spec-row">
              <el-input v-model="spec.name" placeholder="规格名" style="width: 120px" />
              <el-input-number v-model="spec.price" :min="0" :precision="2" placeholder="价格" />
              <el-input-number v-model="spec.stock" :min="0" placeholder="库存" />
              <el-button link type="danger" @click="form.specs.splice(idx, 1)">删除</el-button>
            </div>
            <el-button type="primary" link @click="form.specs.push({ name: '', price: 0, stock: 0 })">
              + 添加规格
            </el-button>
          </div>
        </el-form-item>
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
import { getProducts, createProduct, updateProduct, deleteProduct, toggleProductStatus, getAllCategories, importCards, clearSpecCards, clearProductCards, uploadFile } from '@/api'
import { ElMessage } from 'element-plus'

const products = ref<any[]>([])
const categories = ref<any[]>([])
const page = ref(1)
const total = ref(0)
const dialogVisible = ref(false)
const editId = ref<number | null>(null)
const saving = ref(false)

const filters = reactive({ keyword: '', category_id: null as number | null, status: null as number | null })
const form = reactive({ name: '', categoryId: null as number | null, description: '', cover: '', specs: [] as any[] })

onMounted(() => {
  loadProducts()
  loadCategories()
})

async function loadCategories() {
  try {
    const result = await getAllCategories() as any
    categories.value = result
  } catch (e) { console.error(e) }
}

async function loadProducts() {
  try {
    const result = await getProducts({ ...filters, page: page.value, pageSize: 20 }) as any
    products.value = result.list || []
    total.value = result.total || 0
  } catch (e) { console.error(e) }
}

function openDialog(product?: any) {
  if (product) {
    editId.value = product.id
    form.name = product.name
    form.categoryId = product.categoryId
    form.description = product.description
    form.cover = product.cover || ''
    form.specs = product.specs ? JSON.parse(JSON.stringify(product.specs)) : []
  } else {
    editId.value = null
    form.name = ''
    form.categoryId = null
    form.description = ''
    form.cover = ''
    form.specs = []
  }
  dialogVisible.value = true
}

async function handleSave() {
  saving.value = true
  try {
    if (editId.value) {
      await updateProduct(editId.value, form)
    } else {
      await createProduct(form)
    }
    ElMessage.success('保存成功')
    dialogVisible.value = false
    loadProducts()
  } catch (e) { console.error(e) } finally { saving.value = false }
}

async function handleToggle(row: any) {
  try {
    await toggleProductStatus(row.id)
    loadProducts()
  } catch (e) { console.error(e) }
}

async function handleDelete(id: number) {
  try {
    await deleteProduct(id)
    ElMessage.success('删除成功')
    loadProducts()
  } catch (e) { console.error(e) }
}

const cardDrawerVisible = ref(false)
const cardProduct = ref<any>(null)
const importSpec = ref<any>(null)
const importText = ref('')
const importing = ref(false)

async function openCardDrawer(product: any) {
  cardProduct.value = product
  importSpec.value = null
  cardDrawerVisible.value = true
}

function startImport(spec: any) {
  importSpec.value = spec
  importText.value = ''
}

async function handleImport() {
  if (!importSpec.value || !importText.value.trim()) return
  importing.value = true
  try {
    const cards = importText.value.split('\n').map(s => s.trim()).filter(Boolean)
    await importCards({ product_id: cardProduct.value.id, spec_id: importSpec.value.id, cards })
    ElMessage.success('导入成功')
    importSpec.value = null
    importText.value = ''
    await loadProducts()
    cardProduct.value = products.value.find(p => p.id === cardProduct.value.id)
  } catch (e: any) {
    ElMessage.error(e.message || '导入失败')
  } finally { importing.value = false }
}

async function handleClearSpec(specId: number) {
  try {
    await clearSpecCards(specId)
    ElMessage.success('已清空')
    await loadProducts()
    cardProduct.value = products.value.find(p => p.id === cardProduct.value.id)
  } catch (e: any) { ElMessage.error(e.message || '清空失败') }
}

async function handleClearProduct() {
  try {
    await clearProductCards(cardProduct.value.id)
    ElMessage.success('已清空全部')
    await loadProducts()
    cardProduct.value = products.value.find(p => p.id === cardProduct.value.id)
  } catch (e: any) { ElMessage.error(e.message || '清空失败') }
}

const uploading = ref(false)
async function handleCoverChange(file: any) {
  if (!file?.raw) return
  uploading.value = true
  try {
    const result = await uploadFile(file.raw) as any
    form.cover = result.url || ('/uploads/' + result.filename)
  } catch (e: any) {
    ElMessage.error(e.message || '上传失败')
  } finally {
    uploading.value = false
  }
}
</script>

<style scoped>
.card-mgmt h4 { margin: 0 0 16px; }
.spec-card-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #eee;
}
.spec-info { display: flex; align-items: center; gap: 12px; }
.spec-name { font-weight: 500; }
.spec-actions { display: flex; gap: 8px; }
.import-section { margin-top: 20px; padding-top: 16px; border-top: 1px solid #eee; }
.import-section h4 { margin: 0 0 8px; }

.cover-upload {
  width: 100%;
}
.cover-preview {
  position: relative;
  display: inline-block;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e4e7ed;
}
.cover-preview img {
  display: block;
  width: 240px;
  height: 140px;
  object-fit: cover;
}
.cover-remove {
  position: absolute;
  top: 6px;
  right: 6px;
  padding: 4px 8px !important;
  border-radius: 50% !important;
}
.cover-upload-btn {
  width: 240px;
  height: 140px;
  border: 1px dashed #dcdfe6;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #909399;
  cursor: pointer;
  transition: border-color 0.2s;
}
.cover-upload-btn:hover {
  border-color: var(--el-color-primary);
  color: var(--el-color-primary);
}
.cover-upload-btn i {
  font-size: 24px;
}
</style>
