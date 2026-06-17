<template>
  <div class="page-home">
    <section class="hero">
      <div class="hero-content">
        <h1>星云发卡</h1>
        <p class="hero-sub">24小时自动发卡 · 安全便捷 · 即时到账</p>
        <div class="hero-search">
          <input
            v-model="keyword"
            type="text"
            placeholder="搜索卡密商品..."
            @keyup.enter="filterProducts"
          />
          <button @click="filterProducts">
            <i class="fas fa-search"></i>
          </button>
        </div>
      </div>
    </section>

    <section class="categories">
      <div class="container">
        <div class="category-tabs">
          <button
            :class="['cat-tab', { active: activeCategory === null }]"
            @click="selectCategory(null)"
          >
            全部
          </button>
          <button
            v-for="cat in categories"
            :key="cat.id"
            :class="['cat-tab', { active: activeCategory === cat.id }]"
            @click="selectCategory(cat.id)"
          >
            {{ cat.icon }} {{ cat.name }}
          </button>
        </div>
      </div>
    </section>

    <section class="products-section">
      <div class="container">
        <div v-if="loading" class="loading">
          <i class="fas fa-spinner fa-spin"></i> 加载中...
        </div>
        <div v-else-if="products.length === 0" class="empty">
          <i class="fas fa-box-open"></i>
          <p>暂无商品</p>
        </div>
        <div v-else class="product-grid">
          <div
            v-for="product in products"
            :key="product.id"
            class="product-card"
            @click="goToProduct(product.id)"
          >
            <div class="product-cover">
              <img v-if="product.cover" :src="product.cover" :alt="product.name" />
              <div v-else class="product-cover-placeholder">
                <i class="fas fa-ticket-alt"></i>
              </div>
            </div>
            <div class="product-info">
              <h3 class="product-name">{{ product.name }}</h3>
              <p class="product-desc">{{ product.description }}</p>
              <div class="product-price">{{ priceRange(product) }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getCategories, getProducts } from '@/api'

interface Category { id: number; name: string; icon: string; sort: number }
interface Product { id: number; name: string; description: string; cover: string; minPrice: number; maxPrice: number; categoryId: number }

const router = useRouter()
const categories = ref<Category[]>([])
const products = ref<Product[]>([])
const activeCategory = ref<number | null>(null)
const keyword = ref('')
const loading = ref(false)

function priceRange(p: Product) {
  if (p.minPrice === p.maxPrice) return `¥${p.minPrice}`
  return `¥${p.minPrice} - ¥${p.maxPrice}`
}

function goToProduct(id: number) {
  router.push(`/product/${id}`)
}

async function filterProducts() {
  loading.value = true
  try {
    const result = await getProducts({
      category_id: activeCategory.value || undefined,
      keyword: keyword.value || undefined,
      page_size: 100,
    }) as any
    products.value = result.list || result
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function selectCategory(id: number | null) {
  activeCategory.value = id
  filterProducts()
}

onMounted(async () => {
  loading.value = true
  try {
    const [cats, prods] = await Promise.all([
      getCategories() as any,
      getProducts({ page_size: 100 }) as any,
    ])
    categories.value = cats
    products.value = prods.list || prods
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})
</script>
