import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/Login.vue'),
    },
    {
      path: '/',
      component: () => import('@/layouts/AdminLayout.vue'),
      redirect: '/dashboard',
      children: [
        { path: 'dashboard', name: 'dashboard', component: () => import('@/views/Dashboard.vue') },
        { path: 'products', name: 'products', component: () => import('@/views/Products.vue') },
        { path: 'orders', name: 'orders', component: () => import('@/views/Orders.vue') },
        { path: 'cards', name: 'cards', component: () => import('@/views/Cards.vue') },
        { path: 'categories', name: 'categories', component: () => import('@/views/Categories.vue') },
        { path: 'coupons', name: 'coupons', component: () => import('@/views/Coupons.vue') },
        { path: 'settings', name: 'settings', component: () => import('@/views/Settings.vue') },
        { path: 'analytics', name: 'analytics', component: () => import('@/views/Analytics.vue') },
      ],
    },
  ],
})

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('admin_token')
  if (to.name !== 'login' && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router
