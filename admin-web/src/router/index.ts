import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', name: 'login', component: () => import('@/views/login/Login.vue') },
    {
      path: '/',
      component: () => import('@/layouts/AdminLayout.vue'),
      redirect: '/dashboard',
      children: [
        { path: 'dashboard', name: 'dashboard', component: () => import('@/views/dashboard/Overview.vue') },
        { path: 'service/feedback', component: () => import('@/views/service/FeedbackList.vue') },
        { path: 'service/tickets', component: () => import('@/views/service/TicketList.vue') },
        { path: 'service/reviews', component: () => import('@/views/service/ReviewList.vue') },
        { path: 'service/faqs', component: () => import('@/views/service/FaqList.vue') },
        { path: 'service/questionnaires', component: () => import('@/views/service/QuestionnaireList.vue') },
        { path: 'service/config', component: () => import('@/views/service/ServiceConfig.vue') },
        { path: 'content/home', component: () => import('@/views/home/HomeConfig.vue') },
        { path: 'content/discover', component: () => import('@/views/discover/PostList.vue') },
        { path: 'content/discover/edit/:id?', component: () => import('@/views/discover/PostEdit.vue') },
      ],
    },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.path !== '/login' && !auth.isLoggedIn()) return '/login'
  if (to.path === '/login' && auth.isLoggedIn()) return '/dashboard'
})

export default router
