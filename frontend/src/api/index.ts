import http from './http'

export function getCategories() {
  return http.get('/categories')
}

export function getProducts(params?: { category_id?: number; keyword?: string; page?: number; page_size?: number; sort?: string }) {
  return http.get('/products', { params })
}

export function getProductDetail(id: number) {
  return http.get(`/products/${id}`)
}

export function createOrder(data: { items: any[]; email: string; payment_method: string; coupon_code?: string; extract_password?: string }) {
  return http.post('/orders', data)
}

export function getOrderStatus(orderNo: string) {
  return http.get(`/orders/status/${orderNo}`)
}

export function getOrderStatusByToken(token: string) {
  return http.get(`/orders/status-by-token/${token}`)
}

export function queryOrder(email: string, orderNo: string, extractPassword?: string) {
  const params: any = { email, order_no: orderNo }
  if (extractPassword) params.extract_password = extractPassword
  return http.get('/orders/query', { params })
}

export function queryOrderByToken(token: string, extractPassword?: string) {
  const params: any = { token }
  if (extractPassword) params.extract_password = extractPassword
  return http.get('/orders/query-by-token', { params })
}

export function createPayment(data: { order_no: string; method: string; amount: number }) {
  return http.post('/payments/create', data)
}

export function simulatePayment(orderNo: string) {
  return http.post('/orders/simulate-pay', { order_no: orderNo })
}

export function simulatePaymentByToken(token: string) {
  return http.post('/orders/simulate-pay-by-token', { token })
}
