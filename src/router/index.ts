import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

import LoginView from '../views/LoginView.vue'
import MainLayout from '../components/layout/MainLayout.vue'
import DashboardView from '../views/DashboardView.vue'

// Admin Views
import DivisionView from '../views/admin/DivisionView.vue'
import EmployeeView from '../views/admin/EmployeeView.vue'
import IndicatorView from '../views/admin/IndicatorView.vue'
import PeriodView from '../views/admin/PeriodView.vue'
import ReportView from '../views/admin/ReportView.vue'

// Manager Views
import TeamView from '../views/manager/TeamView.vue'

// Employee Views
import MyPerformanceView from '../views/employee/MyPerformanceView.vue'
import MyEvaluationDetail from '../views/employee/MyEvaluationDetail.vue'

// Common Views
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
        // --- ADMIN ROUTES ---
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
          path: '/admin/employees/:id', // URL dinamis dengan ID
          name: 'AdminEmployeeDetail',
          component: () => import('../views/admin/EmployeeDetailView.vue'),
          meta: { requiresAuth: true, role: 'admin', title: 'Detail Pegawai' }
        },
        {
            path: '/admin/logs',
            name: 'ActivityLogs',
            component: () => import('../views/admin/ActivityLogView.vue'),
            meta: { requiresAuth: true, role: 'admin', title: 'Audit Trail' }
        },
                
        // --- MANAGER ROUTES (Menilai Tim) ---
        // Diakses oleh Manager & Admin (untuk menilai Manager)
        {
          path: 'manager/team',
          name: 'ManagerTeam',
          component: TeamView,
          meta: { role: 'manager_access' } // Custom meta role
        },
        {
          path: 'manager/assessment/:id', 
          name: 'ManagerAssessmentForm',
          component: () => import('../views/manager/AssessmentForm.vue'), 
          meta: { role: 'manager_access' }
        },

        // --- EMPLOYEE ROUTES (Lihat Nilai Sendiri) ---
        // Diakses oleh Employee & Manager (karena Manager juga dinilai)
        {
          path: 'employee/history',
          name: 'MyHistory',
          component: MyPerformanceView,
          meta: { role: 'employee' } // Tetap 'employee', tapi logic di guard kita ubah
        },
        {
          path: 'employee/evaluation/:id',
          name: 'MyEvaluationDetail',
          component: MyEvaluationDetail,
          meta: { role: 'employee' }
        },

        {
          path: '/employee/warnings',
          name: 'MyWarnings',
          component: () => import('../views/employee/MyWarningsView.vue'),
          meta: { requiresAuth: true, role: 'employee', title: 'Riwayat Pelanggaran' }
        },

        // --- COMMON ROUTES ---
        {
          path: 'profile',
          name: 'UserProfile',
          component: ProfileView,
        },
        {
          path: '/executive/dashboard',
          name: 'ExecutiveDashboard',
          // Perhatikan nama file path yang di-import
          component: () => import('../views/ExecutiveDashboard.vue'), 
          meta: { requiresAuth: true }, 
          // Hapus parameter 'to' dan 'from', biarkan saja kosong, 
          // atau gunakan underscore (_) untuk memberi tahu TypeScript bahwa parameter ini sengaja diabaikan.
          beforeEnter: (_to, _from, next) => { 
            const authStore = useAuthStore()
            if (authStore.isExecutive) {
              next()
            } else {
              next('/403') // Lebih baik arahkan ke halaman 403 Forbidden
            }
          }
        },
      ]
    }
  ]
})

router.beforeEach((to, _from, next) => {
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
    // 1. MANAGER ROUTE: Admin & Manager Boleh
    if (to.meta.role === 'manager') {
      if (userRole !== 'manager' && userRole !== 'admin') {
        next('/403')
        return
      }
    }
    // 2. ADMIN ROUTE: Hanya Admin
    else if (to.meta.role === 'admin' && userRole !== 'admin') {
      next('/403')
      return
    }
    // 3. EMPLOYEE ROUTE: Employee & Manager Boleh
    // (FIX: Tambahkan izin untuk Manager agar bisa lihat raport dirinya)
    else if (to.meta.role === 'employee') {
      if (userRole !== 'employee' && userRole !== 'manager') {
        next('/403')
        return
      }
    }
  }

  next()
})

export default router
