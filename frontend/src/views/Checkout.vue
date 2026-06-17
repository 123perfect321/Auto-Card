<template>
  <div class="page-checkout">
    <div class="container">
      <h2>确认订单</h2>

      <div v-if="cart.items.length === 0" class="empty">
        <i class="fas fa-shopping-cart"></i>
        <p>购物车为空</p>
        <router-link to="/" class="btn-primary">去选购</router-link>
      </div>

      <div v-else class="checkout-layout">
        <div class="order-items">
          <div v-for="(item, idx) in cart.items" :key="idx" class="order-item">
            <div class="item-info">
              <h4>{{ item.productName }}</h4>
              <p>{{ item.specName }} x {{ item.quantity }}</p>
            </div>
            <div class="item-price">¥{{ (item.price * item.quantity).toFixed(2) }}</div>
            <button class="item-remove" @click="cart.removeItem(idx)">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>

        <div class="checkout-form">
          <div class="form-group">
            <label>收货邮箱</label>
            <input v-model="email" type="email" placeholder="用于接收卡密信息" />
          </div>

          <div class="form-group">
            <label>支付方式</label>
            <div class="payment-methods">
              <button
                v-for="m in paymentMethods"
                :key="m.value"
                :class="['pay-method', { active: paymentMethod === m.value }]"
                @click="paymentMethod = m.value"
              >
                <i :class="m.icon"></i> {{ m.label }}
              </button>
            </div>
          </div>

          <div class="form-group">
            <label>优惠券</label>
            <input v-model="couponCode" type="text" placeholder="输入优惠码（可选）" />
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="useExtractPassword" />
              <span>使用卡密提取密码</span>
            </label>
            <p class="checkbox-hint">开启后，查询卡密时需要输入此密码</p>
            <input v-if="useExtractPassword" v-model="extractPassword" type="password"
                   placeholder="设置提取密码（至少4位）" class="extract-pwd-input" />
          </div>

          <div class="checkout-summary">
            <div class="summary-row">
              <span>商品总额</span>
              <span>¥{{ cart.totalAmount.toFixed(2) }}</span>
            </div>
            <div class="summary-row total">
              <span>应付金额</span>
              <strong>¥{{ cart.totalAmount.toFixed(2) }}</strong>
            </div>
          </div>

          <button class="btn-primary btn-lg btn-block" @click="submitOrder" :disabled="submitting">
            {{ submitting ? '提交中...' : '提交订单' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { createOrder } from '@/api'

const router = useRouter()
const cart = useCartStore()
const email = ref('')
const paymentMethod = ref('alipay')
const couponCode = ref('')
const submitting = ref(false)
const useExtractPassword = ref(false)
const extractPassword = ref('')

const paymentMethods = [
  { value: 'alipay', label: '支付宝', icon: 'fab fa-alipay' },
  { value: 'wechat', label: '微信', icon: 'fab fa-weixin' },
  { value: 'usdt', label: 'USDT', icon: 'fas fa-coins' },
]

async function submitOrder() {
  if (!email.value) return alert('请输入邮箱')
  if (cart.items.length === 0) return alert('购物车为空')

  submitting.value = true
  try {
    const result = await createOrder({
      items: cart.items.map(item => ({
        product_id: item.productId,
        spec_id: item.specId,
        quantity: item.quantity,
      })),
      email: email.value,
      payment_method: paymentMethod.value,
      coupon_code: couponCode.value || undefined,
      extract_password: useExtractPassword.value ? extractPassword.value : undefined,
    }) as any

    localStorage.setItem(`order_email_${result.order_no}`, email.value)
    localStorage.setItem(`order_token_${result.order_no}`, result.token)
    cart.clear()
    router.push(`/pay/${result.token}`)
  } catch (e: any) {
    alert(e.message)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-weight: normal;
}
.checkbox-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: var(--primary, #6366f1);
  flex-shrink: 0;
}
.checkbox-hint {
  font-size: 0.8rem;
  color: var(--text-muted, #999);
  margin: 4px 0 0 24px;
}
.extract-pwd-input {
  width: 100%;
  margin-top: 8px;
  padding: 10px 12px;
  border: 1px solid var(--border-color, #ddd);
  border-radius: 6px;
  font-size: 0.9rem;
}
</style>
