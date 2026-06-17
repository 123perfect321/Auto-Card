<template>
  <div class="page-success">
    <div class="container">
      <div class="success-card">
        <div class="success-icon">
          <i class="fas fa-check-circle"></i>
        </div>
        <h2>支付成功</h2>
        <p class="success-order">订单号：{{ orderNo }}</p>

        <div v-if="needsPassword && !unlocked" class="extract-password-form">
          <h3>请输入提取密码</h3>
          <div class="form-group" style="margin: 16px 0;">
            <input v-model="extractPwd" type="password" placeholder="提取密码" @keyup.enter="unlockCards" />
          </div>
          <button class="btn-primary" @click="unlockCards" :disabled="loading">确认提取</button>
        </div>

        <div v-else-if="loading" class="loading">
          <i class="fas fa-spinner fa-spin"></i> 正在获取卡密...
        </div>

        <div v-else-if="orderItems.length > 0" class="delivery-list">
          <div v-for="(item, idx) in orderItems" :key="idx" class="delivery-item">
            <div class="delivery-header">
              <h4>{{ item.productName }}</h4>
              <span class="delivery-spec">{{ item.specName }} x{{ item.quantity }}</span>
            </div>
            <div v-if="item.cards && item.cards.length > 0" class="card-list">
              <div v-for="(card, cidx) in item.cards" :key="cidx" class="card-item">
                <code>{{ card }}</code>
                <button class="copy-btn" @click="copyCard(card)">
                  <i class="fas fa-copy"></i> 复制
                </button>
              </div>
            </div>
            <div v-else class="card-pending-inline">
              <i class="fas fa-hourglass-half"></i> 卡密发放中...
            </div>
          </div>

          <p class="email-hint">
            <i class="fas fa-envelope"></i>
            卡密信息已发送至您的邮箱
          </p>
        </div>

        <div v-else class="card-pending">
          <i class="fas fa-hourglass-half"></i>
          <p>卡密正在发放中，请稍候刷新查看</p>
        </div>

        <div class="success-actions">
          <router-link to="/" class="btn-primary">返回首页</router-link>
          <router-link to="/query" class="btn-outline">查询订单</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getOrderStatusByToken, queryOrderByToken } from '@/api'

interface OrderItemWithCards {
  productName: string
  specName: string
  quantity: number
  cards: string[]
}

const route = useRoute()
const token = route.params.token as string
const orderNo = ref('')
const orderItems = ref<OrderItemWithCards[]>([])
const loading = ref(true)
const needsPassword = ref(false)
const unlocked = ref(false)
const extractPwd = ref('')

onMounted(async () => {
  try {
    const status = await getOrderStatusByToken(token) as any
    if (status.use_extract_password === 1 && status.status >= 2) {
      needsPassword.value = true
      loading.value = false
      return
    }
    await loadCards()
  } catch (e) {
    console.error(e)
    loading.value = false
  }
})

async function loadCards(pwd?: string) {
  loading.value = true
  try {
    const result = await queryOrderByToken(token, pwd) as any
    orderNo.value = result.order_no
    const items = result.items || []
    const allCards: string[] = result.cards || []

    let cardIdx = 0
    orderItems.value = items.map((item: any) => {
      const itemCards: string[] = []
      for (let i = 0; i < item.quantity && cardIdx < allCards.length; i++) {
        itemCards.push(allCards[cardIdx++])
      }
      return {
        productName: item.productName,
        specName: item.specName,
        quantity: item.quantity,
        cards: itemCards,
      }
    })
  } finally {
    loading.value = false
  }
}

async function unlockCards() {
  if (!extractPwd.value) return alert('请输入提取密码')
  try {
    await loadCards(extractPwd.value)
    unlocked.value = true
  } catch (e: any) {
    alert(e.message)
  }
}

function copyCard(card: string) {
  navigator.clipboard.writeText(card).then(() => {
    alert('已复制到剪贴板')
  })
}
</script>

<style scoped>
.delivery-list { text-align: left; margin-bottom: 24px; }
.delivery-item {
  background: var(--bg-input);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
}
.delivery-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.delivery-header h4 { margin: 0; font-size: 1rem; }
.delivery-spec { color: var(--text-secondary); font-size: 0.85rem; }
.card-pending-inline {
  color: var(--text-muted);
  font-size: 0.9rem;
  padding: 8px 0;
}
.card-pending-inline i { margin-right: 4px; }
.extract-password-form {
  text-align: left;
  margin: 20px 0;
}
.extract-password-form input {
  width: 100%;
  padding: 10px;
  border: 1px solid var(--border-color, #ddd);
  border-radius: 6px;
}
</style>
