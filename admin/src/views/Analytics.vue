<template>
  <div class="page-analytics">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card shadow="never">
          <template #header>销售趋势（近30天）</template>
          <div ref="trendChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>商品销量排行</template>
          <div ref="rankChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>支付方式分布</template>
          <div ref="payChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'

const trendChartRef = ref<HTMLElement>()
const rankChartRef = ref<HTMLElement>()
const payChartRef = ref<HTMLElement>()

onMounted(() => {
  if (trendChartRef.value) {
    const chart = echarts.init(trendChartRef.value)
    const days = Array.from({ length: 30 }, (_, i) => `${i + 1}日`)
    chart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: days },
      yAxis: { type: 'value' },
      series: [{
        data: Array.from({ length: 30 }, () => Math.floor(Math.random() * 1000 + 500)),
        type: 'line', smooth: true,
        areaStyle: { opacity: 0.2 },
        lineStyle: { color: '#6B72E1' }, itemStyle: { color: '#6B72E1' },
      }],
    })
  }

  if (rankChartRef.value) {
    const chart = echarts.init(rankChartRef.value)
    chart.setOption({
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      xAxis: { type: 'value' },
      yAxis: { type: 'category', data: ['Netflix月卡', 'ChatGPT Plus', 'Spotify季卡', 'Steam $10', 'YouTube年卡'] },
      series: [{
        data: [120, 98, 87, 76, 65],
        type: 'bar',
        itemStyle: { color: '#6B72E1', borderRadius: [0, 4, 4, 0] },
      }],
    })
  }

  if (payChartRef.value) {
    const chart = echarts.init(payChartRef.value)
    chart.setOption({
      tooltip: { trigger: 'item' },
      series: [{
        type: 'pie', radius: ['40%', '70%'],
        data: [
          { value: 580, name: '支付宝' },
          { value: 320, name: '微信' },
          { value: 100, name: 'USDT' },
        ],
        itemStyle: { borderRadius: 6 },
        color: ['#6B72E1', '#4ADE80', '#FBBF24'],
      }],
    })
  }
})
</script>
