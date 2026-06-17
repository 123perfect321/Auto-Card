import http from './http'

export function login(data: { username: string; password: string }) {
  return http.post('/auth/login', data)
}

export function getAdminInfo() {
  return http.get('/auth/me')
}

export function changePassword(data: { oldPassword: string; newPassword: string }) {
  return http.put('/auth/password', data)
}

export function getDashboardStats() {
  return http.get('/dashboard')
}

export function getCardStats() {
  return http.get('/cards/stats')
}

export function getCategories() {
  return http.get('/categories')
}

export function getAllCategories() {
  return http.get('/categories/admin/all')
}

export function createCategory(data: any) {
  return http.post('/categories', data)
}

export function updateCategory(id: number, data: any) {
  return http.put(`/categories/${id}`, data)
}

export function deleteCategory(id: number) {
  return http.delete(`/categories/${id}`)
}

export function getProducts(params?: any) {
  return http.get('/products/admin/list', { params })
}

export function createProduct(data: any) {
  return http.post('/products', data)
}

export function updateProduct(id: number, data: any) {
  return http.put(`/products/${id}`, data)
}

export function deleteProduct(id: number) {
  return http.delete(`/products/${id}`)
}

export function toggleProductStatus(id: number) {
  return http.patch(`/products/${id}/status`)
}

export function getOrders(params?: any) {
  return http.get('/orders/admin/list', { params })
}

export function getCards(params?: any) {
  return http.get('/cards', { params })
}

export function importCards(data: { product_id: number; spec_id: number; cards: string[] }) {
  return http.post('/cards/import', data)
}

export function invalidateCard(id: number) {
  return http.post(`/cards/${id}/invalidate`)
}

export function clearSpecCards(specId: number) {
  return http.delete(`/cards/spec/${specId}`)
}

export function clearProductCards(productId: number) {
  return http.delete(`/cards/product/${productId}`)
}

export function getSettings() {
  return http.get('/settings')
}

export function updateSettings(data: any) {
  return http.put('/settings', data)
}

export function uploadFile(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return http.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
