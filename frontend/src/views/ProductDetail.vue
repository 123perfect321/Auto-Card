<template>
  <div class="page-detail">
    <div class="container">
      <button class="back-btn" @click="router.back()">
        <i class="fas fa-arrow-left"></i> 返回
      </button>

      <div v-if="loading" class="loading">
        <i class="fas fa-spinner fa-spin"></i>
      </div>

      <div v-else-if="product" class="detail-layout">
        <div class="detail-cover">
          <img v-if="product.cover" :src="product.cover" :alt="product.name" />
          <div v-else class="detail-cover-placeholder">
            <i class="fas fa-ticket-alt"></i>
          </div>
        </div>

        <div class="detail-info">
          <h1>{{ product.name }}</h1>
          <p class="detail-desc">{{ product.description }}</p>

          <div class="spec-list">
            <h3>选择规格</h3>
            <div class="specs">
              <button
                v-for="spec in product.specs"
                :key="spec.id"
                :class="['spec-btn', { active: selectedSpec?.id === spec.id }]"
                @click="selectedSpec = spec"
              >
                <span class="spec-name">{{ spec.name }}</span>
                <span class="spec-price">¥{{ spec.price }}</span>
                <span class="spec-stock">库存 {{ spec.availableStock ?? spec.stock }}</span>
              </button>
            </div>
          </div>

          <div class="quantity-row">
            <label>数量</label>
            <div class="quantity-ctrl">
              <button @click="quantity > 1 && quantity--">-</button>
              <input v-model.number="quantity" type="number" min="1" :max="selectedSpec?.availableStock ?? selectedSpec?.stock ?? 1" />
              <button @click="quantity < (selectedSpec?.availableStock ?? selectedSpec?.stock ?? 1) && quantity++">+</button>
            </div>
          </div>

          <div class="detail-total">
            合计：<strong>¥{{ totalPrice }}</strong>
          </div>

          <button class="btn-primary btn-lg" @click="addToCart" :disabled="!selectedSpec || (selectedSpec.availableStock ?? selectedSpec.stock) <= 0">
            {{ (!selectedSpec || (selectedSpec.availableStock ?? selectedSpec.stock) <= 0) ? '暂无库存' : '确认支付' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getProductDetail } from '@/api'
import { useCartStore } from '@/stores/cart'

interface Spec { id: number; name: string; price: number; stock: number; availableStock?: number }
interface Product {
  id: number; name: string; description: string; cover: string;
  specs: Spec[]; categoryId: number; viewCount: number;
}

const route = useRoute()
const router = useRouter()
const cart = useCartStore()
const product = ref<Product | null>(null)
const selectedSpec = ref<Spec | null>(null)
const quantity = ref(1)
const loading = ref(true)

const totalPrice = computed(() => {
  if (!selectedSpec.value) return '0.00'
  return (selectedSpec.value.price * quantity.value).toFixed(2)
})

onMounted(async () => {
  try {
    const id = Number(route.params.id)
    const result = await getProductDetail(id) as any
    product.value = result
    if (result.specs?.length > 0) {
      selectedSpec.value = result.specs[0]
    }
  } catch (e: any) {
    alert(e.message)
  } finally {
    loading.value = false
  }
})

function addToCart() {
  if (!product.value || !selectedSpec.value) return
  cart.addItem({
    productId: product.value.id,
    productName: product.value.name,
    specId: selectedSpec.value.id,
    specName: selectedSpec.value.name,
    price: selectedSpec.value.price,
    quantity: quantity.value,
    coverImage: product.value.cover,
  })
  router.push('/checkout')
}
</script>
