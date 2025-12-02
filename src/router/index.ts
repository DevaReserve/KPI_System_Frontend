import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

import LoginView from '../views/LoginView.vue'
import MainLayout from '../components/layout/MainLayout.vue'
import DashboardView from '../views/DashboardView.vue'
import DivisionView from '../views/admin/DivisionView.vue'
import EmployeeView from '../views/admin/EmployeeView.vue'
import IndicatorView from '../views/admin/IndicatorView.vue'
import PeriodView from '../views/admin/PeriodView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: LoginView,
      meta: { requiresAuth: false }
    },
    {
      path: '/',
      component: MainLayout, 
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'Dashboard',
          component: DashboardView
        },
        {
          path: 'admin/divisions',
          name: 'AdminDivisions',
          component: DivisionView,
          meta: { role: 'admin' } 
        },
        {
          path: 'admin/employees',
          name: 'AdminEmployees',
          component: EmployeeView,
          meta: { role: 'admin' }
        },
        {
          path: 'admin/indicators',
          name: 'AdminIndicators',
          component: IndicatorView,
          meta: { role: 'admin' }
        },
        {
          path: 'admin/periods',
          name: 'AdminPeriods',
          component: PeriodView,
          meta: { role: 'admin' }
        },
      ]
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ]
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.name === 'Login' && authStore.isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router
