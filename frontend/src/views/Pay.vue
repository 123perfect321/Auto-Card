<template>
  <div class="page-pay">
    <div class="container">
      <div class="pay-card">
        <h2>订单支付</h2>
        <p class="order-no">订单号：{{ orderNo || token.substring(0, 16) + '...' }}</p>

        <div class="pay-amount">
          <span class="currency">¥</span>
          <span class="amount">{{ amount }}</span>
        </div>

        <div v-if="jumpUrl" class="pay-gateway">
          <p class="gateway-hint">正在跳转到支付网关（{{ payMethodLabel }}）...</p>
          <a class="btn-primary" :href="jumpUrl" target="_blank" rel="noopener">
            若未自动跳转，点此进入支付页
          </a>
        </div>

        <div v-else-if="gatewayError" class="pay-gateway pay-gateway-error">
          <p>{{ gatewayError }}</p>
          <button class="btn-primary" @click="jumpToGateway">重新拉起支付</button>
        </div>

        <div v-else class="pay-qr">
          <div class="qr-placeholder">
            <i class="fas fa-qrcode"></i>
            <p>正在创建支付单...</p>
          </div>
        </div>

        <div class="pay-timer">
          <i class="fas fa-clock"></i>
          剩余支付时间：{{ timerText }}
        </div>

        <div class="pay-actions">
          <button class="btn-outline" @click="simulatePay" :disabled="paying || !token">
            {{ paying ? '处理中...' : '模拟支付（测试用）' }}
          </button>
          <router-link to="/" class="btn-outline">返回首页</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getOrderStatusByToken, createPayment, simulatePaymentByToken } from '@/api'

const route = useRoute()
const router = useRouter()
const token = route.params.token as string

const orderNo = ref('')
const amount = ref('0.00')
const paymentMethod = ref('alipay')
const buyerEmail = ref('')
const subject = ref('')

const jumpUrl = ref('')
const gatewayError = ref('')
const paying = ref(false)

const timerText = ref('29:59')
let timer: ReturnType<typeof setInterval>
let expireSeconds = 30 * 60
let pollTimer: ReturnType<typeof setInterval>

const payMethodLabel = computed(() => ({
  alipay: '支付宝', wechat: '微信', wxpay: '微信',
  qqpay: 'QQ', usdt: 'USDT',
} as Record<string, string>)[paymentMethod.value] || paymentMethod.value)

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

  await fetchOrderAndPay()

  pollTimer = setInterval(pollStatus, 4000)
})

onUnmounted(() => {
  clearInterval(timer)
  clearInterval(pollTimer)
})

async function fetchOrderAndPay() {
  gatewayError.value = ''
  jumpUrl.value = ''
  try {
    const info = await getOrderStatusByToken(token) as any
    orderNo.value = info.order_no
    amount.value = Number(info.pay_amount).toFixed(2)
    paymentMethod.value = info.payment_method || 'alipay'
    buyerEmail.value = info.buyer_email || ''
    subject.value = info.subject || '自动发卡'

    if (info.status >= 1) {
      clearInterval(timer)
      router.push(`/success/${token}`)
      return
    }

    await jumpToGateway()
  } catch (e: any) {
    gatewayError.value = '创建支付单失败：' + (e.message || '未知错误')
  }
}

async function jumpToGateway() {
  gatewayError.value = ''
  jumpUrl.value = ''
  try {
    const result = await createPayment({
      order_token: token,
      order_no: orderNo.value,
      method: paymentMethod.value,
      amount: Number(amount.value),
      subject: subject.value,
      email: buyerEmail.value,
    }) as any
    if (result.payment_url) {
      jumpUrl.value = result.payment_url
      window.location.href = result.payment_url
    } else {
      gatewayError.value = '支付网关未返回跳转链接'
    }
  } catch (e: any) {
    gatewayError.value = '拉起支付失败：' + (e.message || '未知错误')
  }
}

async function pollStatus() {
  try {
    const result = await getOrderStatusByToken(token) as any
    if (result.status >= 1) {
      clearInterval(timer)
      clearInterval(pollTimer)
      router.push(`/success/${token}`)
    }
  } catch (e) {
    // ignore transient errors
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

<style scoped>
.pay-gateway {
  margin: 16px 0;
  padding: 16px;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 8px;
  text-align: center;
}
.pay-gateway-error {
  background: #fef2f2;
  border-color: #fecaca;
  color: #991b1b;
}
.gateway-hint {
  margin: 0 0 10px;
  color: #0369a1;
}
</style>
