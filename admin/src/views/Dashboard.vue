<template>
  <div class="dashboard">
    <el-row :gutter="20" class="stat-cards">
      <el-col :span="6" v-for="stat in stats" :key="stat.label">
        <el-card shadow="never" class="stat-card">
          <div class="stat-icon" :style="{ background: stat.color }">
            <el-icon :size="24"><component :is="stat.icon" /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="chart-row">
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>近7日销售额</template>
          <div ref="salesChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>近7日订单数</template>
          <div ref="ordersChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="24">
        <el-card shadow="never">
          <template #header>最近订单</template>
          <el-table :data="recentOrders">
            <el-table-column prop="orderNo" label="订单号" />
            <el-table-column prop="buyerEmail" label="邮箱" />
            <el-table-column prop="payAmount" label="金额">
              <template #default="{ row }">¥{{ row.payAmount }}</template>
            </el-table-column>
            <el-table-column prop="status" label="状态">
              <template #default="{ row }">
                <el-tag :type="statusType(row.status)">{{ statusText(row.status) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createdAt" label="时间" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, markRaw } from 'vue'
import { getOrders, getDashboardStats } from '@/api'
import { Goods, Money, ShoppingCart, Key } from '@element-plus/icons-vue'
import * as echarts from 'echarts'

const salesChartRef = ref<HTMLElement>()
const ordersChartRef = ref<HTMLElement>()
const recentOrders = ref<any[]>([])

const stats = ref([
  { label: '今日销售额', value: '¥0.00', icon: markRaw(Money), color: 'linear-gradient(135deg, #6B72E1, #8187F0)' },
  { label: '今日订单', value: '0', icon: markRaw(ShoppingCart), color: 'linear-gradient(135deg, #4ADE80, #22C55E)' },
  { label: '在售商品', value: '0', icon: markRaw(Goods), color: 'linear-gradient(135deg, #FBBF24, #F59E0B)' },
  { label: '可用卡密', value: '0', icon: markRaw(Key), color: 'linear-gradient(135deg, #F87171, #EF4444)' },
])

function statusText(status: number) {
  return { 0: '待支付', 1: '已支付', 2: '已完成', 3: '已退款', 4: '已关闭' }[status] || '未知'
}

function statusType(status: number): any {
  return { 0: 'warning', 1: 'primary', 2: 'success', 3: 'danger', 4: 'info' }[status] || 'info'
}

onMounted(async () => {
  try {
    const data = await getDashboardStats() as any

    stats.value[0].value = `¥${Number(data.today.sales).toFixed(2)}`
    stats.value[1].value = String(data.today.orders)
    stats.value[2].value = String(data.activeProducts)
    stats.value[3].value = String(data.availableCards)

    initCharts(data.last7Days || [])
  } catch (e) {
    console.error(e)
    initCharts([])
  }

  try {
    const orderResult = await getOrders({ page: 1, pageSize: 10 }) as any
    recentOrders.value = orderResult.list || []
  } catch (e) {
    console.error(e)
  }
})

function initCharts(last7Days: { label: string; sales: number; orders: number }[]) {
  const labels = last7Days.map(d => d.label)
  const salesData = last7Days.map(d => d.sales)
  const ordersData = last7Days.map(d => d.orders)

  if (salesChartRef.value) {
    const chart = echarts.init(salesChartRef.value)
    chart.setOption({
      tooltip: { trigger: 'axis', formatter: '{b}<br/>销售额: ¥{c}' },
      xAxis: { type: 'category', data: labels },
      yAxis: { type: 'value' },
      series: [{
        data: salesData,
        type: 'line',
        smooth: true,
        areaStyle: { opacity: 0.3 },
        lineStyle: { color: '#6B72E1' },
        itemStyle: { color: '#6B72E1' },
      }],
    })
  }

  if (ordersChartRef.value) {
    const chart = echarts.init(ordersChartRef.value)
    chart.setOption({
      tooltip: { trigger: 'axis', formatter: '{b}<br/>订单数: {c}' },
      xAxis: { type: 'category', data: labels },
      yAxis: { type: 'value' },
      series: [{
        data: ordersData,
        type: 'bar',
        itemStyle: { color: '#4ADE80', borderRadius: [4, 4, 0, 0] },
      }],
    })
  }
}
</script>
