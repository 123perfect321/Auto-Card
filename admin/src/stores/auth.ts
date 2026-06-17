import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login as loginApi, getAdminInfo as getAdminInfoApi } from '@/api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('admin_token') || '')
  const adminInfo = ref<any>(null)

  async function login(username: string, password: string) {
    const result = await loginApi({ username, password }) as any
    token.value = result.token
    localStorage.setItem('admin_token', result.token)
  }

  async function fetchAdminInfo() {
    const result = await getAdminInfoApi() as any
    adminInfo.value = result
  }

  function logout() {
    token.value = ''
    adminInfo.value = null
    localStorage.removeItem('admin_token')
  }

  return { token, adminInfo, login, fetchAdminInfo, logout }
})
