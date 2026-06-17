<template>
  <div class="page-query">
    <div class="container">
      <h2>订单查询</h2>

      <div class="query-form">
        <div class="form-group">
          <label>邮箱</label>
          <input v-model="email" type="email" placeholder="请输入下单邮箱" />
        </div>
        <div class="form-group">
          <label>订单号 <span class="optional-hint">（可选，不填则查询最近订单）</span></label>
          <input v-model="orderNo" type="text" placeholder="请输入订单号" />
        </div>
        <div v-if="needsExtractPassword" class="form-group">
          <label>提取密码</label>
          <input v-model="extractPwd" type="password" placeholder="请输入提取密码" @keyup.enter="doQuery" />
        </div>
        <button class="btn-primary btn-block" @click="doQuery" :disabled="querying">
          {{ querying ? '查询中...' : '查询订单' }}
        </button>
      </div>

      <div v-if="orderInfo" class="query-result">
        <div class="result-header">
          <span :class="['status-badge', `status-${orderInfo.status}`]">
            {{ statusText(orderInfo.status) }}
          </span>
          <span class="order-no">{{ orderInfo.order_no }}</span>
        </div>

        <div class="result-items">
          <div v-for="(item, idx) in orderInfo.items" :key="idx" class="result-item">
            <span>{{ item.productName }} - {{ item.specName }} x {{ item.quantity }}</span>
            <span>¥{{ item.subtotal }}</span>
          </div>
        </div>

        <div v-if="orderInfo.cards?.length > 0" class="result-cards">
          <h3>卡密信息</h3>
          <div v-for="(card, idx) in orderInfo.cards" :key="idx" class="card-item">
            <code>{{ card }}</code>
            <button class="copy-btn" @click="copyCard(card)">
              <i class="fas fa-copy"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { queryOrder } from '@/api'

const orderNo = ref('')
const email = ref('')
const querying = ref(false)
const orderInfo = ref<any>(null)
const needsExtractPassword = ref(false)
const extractPwd = ref('')

function statusText(status: number) {
  const map: Record<number, string> = {
    0: '待支付', 1: '已支付', 2: '已完成', 3: '已退款', 4: '已关闭',
  }
  return map[status] || '未知'
}

async function doQuery() {
  if (!email.value) return alert('请填写邮箱')
  querying.value = true
  try {
    const result = await queryOrder(
      email.value,
      orderNo.value,
      needsExtractPassword.value ? extractPwd.value : undefined,
    ) as any
    orderInfo.value = result
  } catch (e: any) {
    if (e.message && (e.message.includes('提取密码'))) {
      needsExtractPassword.value = true
    } else {
      alert(e.message)
    }
  } finally {
    querying.value = false
  }
}

function copyCard(card: string) {
  navigator.clipboard.writeText(card).then(() => alert('已复制'))
}
</script>

<style scoped>
.optional-hint {
  font-size: 0.8rem;
  color: var(--text-muted, #999);
  font-weight: normal;
}
</style>
