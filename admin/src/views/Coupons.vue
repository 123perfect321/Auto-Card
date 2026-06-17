<template>
  <div class="page-coupons">
    <el-card shadow="never">
      <template #header>
        <div class="page-header">
          <h3>优惠券管理</h3>
          <el-button type="primary" @click="dialogVisible = true">新增优惠券</el-button>
        </div>
      </template>

      <el-table :data="coupons">
        <el-table-column prop="code" label="优惠码" />
        <el-table-column label="类型" width="100">
          <template #default="{ row }">{{ row.type === 1 ? '固定金额' : '百分比' }}</template>
        </el-table-column>
        <el-table-column label="优惠值" width="100">
          <template #default="{ row }">{{ row.type === 1 ? `¥${row.value}` : `${row.value}%` }}</template>
        </el-table-column>
        <el-table-column prop="minAmount" label="最低消费" width="100">
          <template #default="{ row }">¥{{ row.minAmount }}</template>
        </el-table-column>
        <el-table-column label="已用/总额" width="100">
          <template #default="{ row }">{{ row.usedQuota }} / {{ row.totalQuota }}</template>
        </el-table-column>
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">{{ row.status === 1 ? '启用' : '停用' }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" title="新增优惠券" width="500px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="优惠码"><el-input v-model="form.code" /></el-form-item>
        <el-form-item label="类型">
          <el-select v-model="form.type">
            <el-option label="固定金额" :value="1" />
            <el-option label="百分比" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="优惠值"><el-input-number v-model="form.value" :min="0" /></el-form-item>
        <el-form-item label="最低消费"><el-input-number v-model="form.minAmount" :min="0" :precision="2" /></el-form-item>
        <el-form-item label="总额度"><el-input-number v-model="form.totalQuota" :min="1" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

const coupons = ref<any[]>([])
const dialogVisible = ref(false)
const form = reactive({ code: '', type: 1, value: 0, minAmount: 0, totalQuota: 100 })
</script>
