<template>
  <div class="page-cards">
    <el-card shadow="never">
      <template #header>
        <div class="page-header">
          <h3>卡密管理</h3>
          <el-button type="primary" @click="importDialog = true">导入卡密</el-button>
        </div>
      </template>

      <div class="filter-bar">
        <el-select v-model="filters.product_id" placeholder="商品" clearable style="width: 200px">
          <el-option v-for="p in products" :key="p.id" :label="p.name" :value="p.id" />
        </el-select>
        <el-select v-model="filters.status" placeholder="状态" clearable style="width: 120px">
          <el-option label="可用" :value="1" />
          <el-option label="已售" :value="2" />
          <el-option label="已锁定" :value="3" />
          <el-option label="已作废" :value="4" />
        </el-select>
        <el-button @click="loadCards">搜索</el-button>
      </div>

      <el-table :data="cards">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="商品">
          <template #default="{ row }">{{ row.product?.name }}</template>
        </el-table-column>
        <el-table-column label="规格">
          <template #default="{ row }">{{ row.spec?.name }}</template>
        </el-table-column>
        <el-table-column prop="content" label="卡密内容" />
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="{ 1: 'success', 2: 'warning', 3: 'info', 4: 'danger' }[row.status as number] as any">
              {{ { 1: '可用', 2: '已售', 3: '锁定', 4: '作废' }[row.status as number] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-popconfirm v-if="row.status !== 2" title="确定作废?" @confirm="handleInvalidate(row.id)">
              <template #reference>
                <el-button link type="danger">作废</el-button>
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
        @current-change="loadCards"
      />
    </el-card>

    <el-dialog v-model="importDialog" title="导入卡密" width="500px">
      <el-form :model="importForm" label-width="80px">
        <el-form-item label="商品">
          <el-select v-model="importForm.product_id" @change="onProductChange">
            <el-option v-for="p in products" :key="p.id" :label="p.name" :value="p.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="规格">
          <el-select v-model="importForm.spec_id">
            <el-option v-for="s in currentSpecs" :key="s.id" :label="s.name" :value="s.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="卡密列表">
          <el-input v-model="importText" type="textarea" :rows="6" placeholder="每行一个卡密" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="importDialog = false">取消</el-button>
        <el-button type="primary" @click="handleImport" :loading="importing">导入</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { getCards, importCards, invalidateCard, getProducts } from '@/api'
import { ElMessage } from 'element-plus'

const cards = ref<any[]>([])
const products = ref<any[]>([])
const page = ref(1)
const total = ref(0)
const filters = reactive({ product_id: null as number | null, status: null as number | null })
const importDialog = ref(false)
const importing = ref(false)
const importText = ref('')
const importForm = reactive({ product_id: null as number | null, spec_id: null as number | null })

const currentSpecs = computed(() => {
  const p = products.value.find(p => p.id === importForm.product_id)
  return p?.specs || []
})

onMounted(async () => {
  loadCards()
  try {
    const result = await getProducts({ page: 1, pageSize: 100 }) as any
    products.value = result.list || []
  } catch (e) { console.error(e) }
})

function onProductChange() {
  importForm.spec_id = null
}

async function loadCards() {
  try {
    const result = await getCards({ ...filters, page: page.value, pageSize: 20 }) as any
    cards.value = result.list || []
    total.value = result.total || 0
  } catch (e) { console.error(e) }
}

async function handleImport() {
  if (!importForm.product_id || !importForm.spec_id) return ElMessage.warning('请选择商品和规格')
  const cardsArr = importText.value.split('\n').filter((l: string) => l.trim())
  if (cardsArr.length === 0) return ElMessage.warning('请输入卡密')

  importing.value = true
  try {
    const result = await importCards({
      product_id: importForm.product_id,
      spec_id: importForm.spec_id,
      cards: cardsArr,
    }) as any
    ElMessage.success(`导入 ${result.imported} 张，跳过 ${result.skipped} 张`)
    importDialog.value = false
    importText.value = ''
    loadCards()
  } catch (e) { console.error(e) } finally { importing.value = false }
}

async function handleInvalidate(id: number) {
  try {
    await invalidateCard(id)
    ElMessage.success('已作废')
    loadCards()
  } catch (e) { console.error(e) }
}
</script>
