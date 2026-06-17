import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/Home.vue'),
    },
    {
      path: '/product/:id',
      name: 'product-detail',
      component: () => import('@/views/ProductDetail.vue'),
    },
    {
      path: '/checkout',
      name: 'checkout',
      component: () => import('@/views/Checkout.vue'),
    },
    {
      path: '/pay/:token',
      name: 'pay',
      component: () => import('@/views/Pay.vue'),
    },
    {
      path: '/success/:token',
      name: 'success',
      component: () => import('@/views/Success.vue'),
    },
    {
      path: '/query',
      name: 'query',
      component: () => import('@/views/Query.vue'),
    },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
