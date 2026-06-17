<template>
  <el-container class="admin-layout">
    <el-aside width="220px" class="admin-sidebar">
      <div class="logo">
        <h2>星云发卡</h2>
        <span>管理后台</span>
      </div>
      <el-menu
        :default-active="route.path"
        router
        background-color="transparent"
        text-color="#9496B8"
        active-text-color="#6B72E1"
      >
        <el-menu-item index="/dashboard">
          <el-icon><DataAnalysis /></el-icon>
          <span>数据概览</span>
        </el-menu-item>
        <el-menu-item index="/products">
          <el-icon><Goods /></el-icon>
          <span>商品管理</span>
        </el-menu-item>
        <el-menu-item index="/orders">
          <el-icon><List /></el-icon>
          <span>订单管理</span>
        </el-menu-item>
        <el-menu-item index="/cards">
          <el-icon><Key /></el-icon>
          <span>卡密管理</span>
        </el-menu-item>
        <el-menu-item index="/categories">
          <el-icon><Folder /></el-icon>
          <span>分类管理</span>
        </el-menu-item>
        <el-menu-item index="/coupons">
          <el-icon><Ticket /></el-icon>
          <span>优惠券</span>
        </el-menu-item>
        <el-menu-item index="/analytics">
          <el-icon><TrendCharts /></el-icon>
          <span>数据分析</span>
        </el-menu-item>
        <el-menu-item index="/settings">
          <el-icon><Setting /></el-icon>
          <span>系统设置</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="admin-header">
        <div class="header-left">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ currentMenu }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <el-avatar :size="32" icon="User" />
              <span>管理员</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="admin-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { DataAnalysis, Goods, List, Key, Folder, Ticket, TrendCharts, Setting } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const menuNames: Record<string, string> = {
  '/dashboard': '数据概览',
  '/products': '商品管理',
  '/orders': '订单管理',
  '/cards': '卡密管理',
  '/categories': '分类管理',
  '/coupons': '优惠券',
  '/analytics': '数据分析',
  '/settings': '系统设置',
}

const currentMenu = computed(() => menuNames[route.path] || '')

function handleCommand(command: string) {
  if (command === 'logout') {
    auth.logout()
    router.push('/login')
  }
}
</script>
