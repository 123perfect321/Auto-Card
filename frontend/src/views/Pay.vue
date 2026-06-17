<template>
  <div class="page-pay">
    <div class="container">
      <div class="pay-card">
        <h2>订单支付</h2>
        <p class="order-no">订单号：{{ token.substring(0, 16) }}...</p>

        <div class="pay-amount">
          <span class="currency">¥</span>
          <span class="amount">{{ amount }}</span>
        </div>

        <div class="pay-qr">
          <div class="qr-placeholder">
            <i class="fas fa-qrcode"></i>
            <p>扫码支付</p>
          </div>
        </div>

        <div class="pay-timer">
          <i class="fas fa-clock"></i>
          剩余支付时间：{{ timerText }}
        </div>

        <div class="pay-actions">
          <button class="btn-primary" @click="simulatePay" :disabled="paying">
            {{ paying ? '处理中...' : '模拟支付' }}
          </button>
          <router-link to="/" class="btn-outline">返回首页</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getOrderStatusByToken, simulatePaymentByToken } from '@/api'

const route = useRoute()
const router = useRouter()
const token = route.params.token as string
const amount = ref('0.00')
const paying = ref(false)
const timerText = ref('29:59')
let timer: ReturnType<typeof setInterval>
let expireSeconds = 30 * 60

onMounted(async () => {
  timer = setInterval(() => {
    expireSeconds--
    const m = Math.floor(expireSeconds / 60)
    const s = expireSeconds % 60
    timerText.value = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    if (expireSeconds <= 0) {
      clearInterval(timer)
      alert('订单已过期')
      router.push('/')
    }
  }, 1000)

  pollStatus()
})

onUnmounted(() => {
  clearInterval(timer)
})

async function pollStatus() {
  try {
    const result = await getOrderStatusByToken(token) as any
    if (result.pay_amount) {
      amount.value = Number(result.pay_amount).toFixed(2)
    }
    if (result.status >= 1) {
      clearInterval(timer)
      router.push(`/success/${token}`)
    }
  } catch (e) {
    console.error(e)
  }
}

async function simulatePay() {
  paying.value = true
  try {
    await simulatePaymentByToken(token)
    router.push(`/success/${token}`)
  } catch (e: any) {
    alert(e.message)
  } finally {
    paying.value = false
  }
}
</script>
