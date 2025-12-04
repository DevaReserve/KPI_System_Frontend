import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

import LoginView from '../views/LoginView.vue'
import MainLayout from '../components/layout/MainLayout.vue'
import DashboardView from '../views/DashboardView.vue'

import DivisionView from '../views/admin/DivisionView.vue'
import EmployeeView from '../views/admin/EmployeeView.vue'
import IndicatorView from '../views/admin/IndicatorView.vue'
import PeriodView from '../views/admin/PeriodView.vue'
import ReportView from '../views/admin/ReportView.vue'

import TeamView from '../views/manager/TeamView.vue'

import MyPerformanceView from '../views/employee/MyPerformanceView.vue'
import MyEvaluationDetail from '../views/employee/MyEvaluationDetail.vue'

import ProfileView from '../views/ProfileView.vue'

import NotFoundView from '../views/error/NotFoundView.vue'
import ForbiddenView from '../views/error/ForbiddenView.vue'

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
      path: '/403',
      name: 'Forbidden',
      component: ForbiddenView
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: NotFoundView
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
          path: 'admin/positions',
          name: 'AdminPositions',
          component: () => import('../views/admin/PositionView.vue'), 
          meta: { role: 'admin' }
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
        {
          path: 'admin/reports',
          name: 'AdminReports',
          component: ReportView,
          meta: { role: 'admin' }
        },
        {
          path: 'manager/team',
          name: 'ManagerTeam',
          component: TeamView,
          meta: { role: 'manager' }
        },
        {
          path: 'manager/assessment/:id', 
          name: 'ManagerAssessmentForm',
          component: () => import('../views/manager/AssessmentForm.vue'), 
          meta: { role: 'manager' }
        },
        {
          path: 'employee/history',
          name: 'MyHistory',
          component: MyPerformanceView,
          meta: { role: 'employee' }
        },
        {
          path: 'employee/evaluation/:id',
          name: 'MyEvaluationDetail',
          component: MyEvaluationDetail,
          meta: { role: 'employee' }
        },

        {
          path: 'profile',
          name: 'UserProfile',
          component: ProfileView,
          // Tidak perlu meta role spesifik karena semua authenticated user boleh akses
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
  const isAuthenticated = authStore.isAuthenticated
  const userRole = authStore.userRole  
  
if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
    return
  }

  if (to.name === 'Login' && isAuthenticated) {
    next('/')
    return
  }

  if (to.meta.role) {
    if (to.meta.role === 'admin' && userRole !== 'admin') {
      next('/403') 
      return
    }
    if (to.meta.role === 'manager' && userRole !== 'manager') {
      next('/403')
      return
    }
    if (to.meta.role === 'employee' && userRole !== 'employee') {
      next('/403')
      return
    }
  }

  next()})

export default router
