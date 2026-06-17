<template>
  <div class="page-orders">
    <el-card shadow="never">
      <template #header><h3>订单管理</h3></template>

      <div class="filter-bar">
        <el-input v-model="filters.keyword" placeholder="订单号/邮箱" clearable style="width: 200px" />
        <el-select v-model="filters.status" placeholder="状态" clearable style="width: 120px">
          <el-option label="待支付" :value="0" />
          <el-option label="已支付" :value="1" />
          <el-option label="已完成" :value="2" />
          <el-option label="已退款" :value="3" />
          <el-option label="已关闭" :value="4" />
        </el-select>
        <el-button @click="loadOrders">搜索</el-button>
      </div>

      <el-table :data="orders">
        <el-table-column type="expand">
          <template #default="{ row }">
            <div style="padding: 12px 20px;">
              <h4 style="margin: 0 0 8px 0; font-size: 14px;">已发放卡密</h4>
              <div v-if="row.cards?.length > 0">
                <div v-for="card in row.cards" :key="card.id" style="padding: 4px 0; font-family: monospace;">
                  {{ card.content }}
                </div>
              </div>
              <div v-else style="color: #999;">暂无卡密</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="orderNo" label="订单号" width="200" />
        <el-table-column prop="buyerEmail" label="邮箱" />
        <el-table-column label="商品">
          <template #default="{ row }">
            {{ row.items?.map((i: any) => i.productName).join(', ') }}
          </template>
        </el-table-column>
        <el-table-column label="金额" width="100">
          <template #default="{ row }">¥{{ row.payAmount }}</template>
        </el-table-column>
        <el-table-column label="支付方式" width="90">
          <template #default="{ row }">
            <span>{{ ({ alipay: '支付宝', wechat: '微信', usdt: 'USDT' } as Record<string, string>)[row.paymentMethod] || row.paymentMethod }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)">{{ statusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="时间" width="170" />
      </el-table>

      <el-pagination
        class="pagination"
        v-model:current-page="page"
        :page-size="20"
        :total="total"
        layout="total, prev, pager, next"
        @current-change="loadOrders"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { getOrders } from '@/api'

const orders = ref<any[]>([])
const page = ref(1)
const total = ref(0)
const filters = reactive({ keyword: '', status: null as number | null })

function statusText(s: number) {
  return { 0: '待支付', 1: '已支付', 2: '已完成', 3: '已退款', 4: '已关闭' }[s] || '未知'
}
function statusType(s: number): any {
  return { 0: 'warning', 1: 'primary', 2: 'success', 3: 'danger', 4: 'info' }[s] || 'info'
}

onMounted(() => loadOrders())

async function loadOrders() {
  try {
    const result = await getOrders({ ...filters, page: page.value, pageSize: 20 }) as any
    orders.value = result.list || []
    total.value = result.total || 0
  } catch (e) { console.error(e) }
}
</script>
