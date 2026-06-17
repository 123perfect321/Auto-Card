import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface CartItem {
  productId: number
  productName: string
  specId: number
  specName: string
  price: number
  quantity: number
  coverImage: string
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])

  function addItem(item: CartItem) {
    const existing = items.value.find(
      i => i.productId === item.productId && i.specId === item.specId
    )
    if (existing) {
      existing.quantity += item.quantity
    } else {
      items.value.push({ ...item })
    }
  }

  function removeItem(index: number) {
    items.value.splice(index, 1)
  }

  function clear() {
    items.value = []
  }

  const totalAmount = computed(() =>
    items.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
  )

  const totalCount = computed(() =>
    items.value.reduce((sum, item) => sum + item.quantity, 0)
  )

  return { items, addItem, removeItem, clear, totalAmount, totalCount }
})
