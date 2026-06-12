import type { ApiResponse, Division, EvaluationPeriod, LoginRequest, LoginResponse, User } from '@/types'
import axios from 'axios'
import Swal from 'sweetalert2'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request & Response Interceptor (TETAP SAMA SEPERTI KODE LAMA ANDA)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Tangkap Error 401 (Unauthorized / Token Expired)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    
    // --- TAMBAHAN BARU: Tangkap Error 403 (Akun Di-DO / Diblokir) ---
    if (error.response && error.response.status === 403) {
      const message = error.response.data.message || error.response.data.error || 'Akses Ditolak. Akun Anda telah dinonaktifkan.'

      Swal.fire({
        title: 'Akses Ditolak',
        text: message,
        icon: 'error',
        confirmButtonText: 'Kembali ke Login',
        customClass: {
          popup: 'rounded-3xl',
          confirmButton: 'bg-blue-600 hover:bg-blue-700'
        }
      }).then(() => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      })
    }
    
    return Promise.reject(error)
  }
)
// ... (Auth, Division services TETAP SAMA) ...
export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', credentials)
    return response.data.data
  },
  async getProfile(): Promise<User> {
    const response = await api.get<ApiResponse<User>>('/auth/profile')
    return response.data.data
  },
  async changePassword(data: any): Promise<void> {
    await api.put('/auth/change-password', data)
  }
}

export const executiveService = {
  async getCompanyPerformance(periodId?: number): Promise<any[]> {
    const url = periodId ? `/executive/company-performance?period_id=${periodId}` : '/executive/company-performance'
    const response = await api.get<ApiResponse<any[]>>(url)
    return response.data.data
  },
  async getPeriods(): Promise<EvaluationPeriod[]> {
    const response = await api.get<ApiResponse<EvaluationPeriod[]>>('/executive/periods')
    return response.data.data
  }
}
export const divisionService = {
  async getAll(): Promise<Division[]> {
    const response = await api.get<ApiResponse<Division[]>>('/admin/divisions')
    return response.data.data
  },
  async create(data: Partial<Division>): Promise<Division> {
    const response = await api.post<ApiResponse<Division>>('/admin/divisions', data)
    return response.data.data
  },
  async update(id: number, data: Partial<Division>): Promise<Division> {
    const response = await api.put<ApiResponse<Division>>(`/admin/divisions/${id}`, data)
    return response.data.data
  },
  async delete(id: number): Promise<void> {
    await api.delete(`/admin/divisions/${id}`)
  }
}

// UPDATE EMPLOYEE SERVICE (TAMBAHKAN FITUR UPLOAD)
export const employeeService = {
  async getAll(): Promise<any[]> {
    const response = await api.get<ApiResponse<any[]>>('/admin/employees')
    return response.data.data
  },
  async create(data: any): Promise<any> {
    const response = await api.post<ApiResponse<any>>('/admin/employees', data)
    return response.data.data
  },
  async update(id: number, data: any): Promise<any> {
    const response = await api.put<ApiResponse<any>>(`/admin/employees/${id}`, data)
    return response.data.data
  },
  async delete(id: number): Promise<void> {
    await api.delete(`/admin/employees/${id}`)
  },
  async resetPassword(id: number): Promise<void> {
    await api.patch(`/admin/employees/${id}/reset-password`)
  },

  // --- FITUR BARU: UPLOAD FOTO PROFIL ---
  async uploadProfilePicture(file: File): Promise<string> {
    const formData = new FormData()
    formData.append('file', file)
    
    // Header 'Content-Type': 'multipart/form-data' otomatis dihandle axios saat ada FormData
    const response = await api.post<ApiResponse<{ url: string }>>('/employee/upload-avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data' 
      }
    })
    return response.data.data.url
  },

  // --- FITUR BARU: PRESTASI / TALENT ---
  async getAchievements(): Promise<any[]> {
    const response = await api.get<ApiResponse<any[]>>('/employee/achievements')
    return response.data.data
  },

  async addAchievement(data: FormData): Promise<any> {
    const response = await api.post<ApiResponse<any>>('/employee/achievements', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data.data
  },

  async updateAchievement(id: number, data: FormData): Promise<any> {
    const response = await api.put<ApiResponse<any>>(`/employee/achievements/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data.data
  },

  async deleteAchievement(id: number): Promise<void> {
    await api.delete(`/employee/achievements/${id}`)
  },

  async getEmployeeAchievementsById(employeeId: number): Promise<any[]> {
    // Sesuaikan URL jika user login adalah admin atau manager
    // Disini saya contohkan pakai endpoint admin
    const response = await api.get<ApiResponse<any[]>>(`/admin/employees/${employeeId}/achievements`)
    return response.data.data
  },
  
  // Ambil detail pegawai by ID (Admin) - Pastikan ini sudah ada
  async getEmployeeById(id: number): Promise<any> {
      const response = await api.get<ApiResponse<any>>(`/admin/employees/${id}`)
      return response.data.data
  }
}

export const indicatorService = {
  async getAll(): Promise<any[]> {
    const response = await api.get<ApiResponse<any[]>>('/admin/indicators')
    return response.data.data
  },
  async create(data: any): Promise<any> {
    const response = await api.post<ApiResponse<any>>('/admin/indicators', data)
    return response.data.data
  },
  async update(id: number, data: any): Promise<any> {
    const response = await api.put<ApiResponse<any>>(`/admin/indicators/${id}`, data)
    return response.data.data
  },
  async delete(id: number): Promise<void> {
    await api.delete(`/admin/indicators/${id}`)
  }
}

export const periodService = {
  async getAll(): Promise<any[]> {
    const response = await api.get<ApiResponse<any[]>>('/periods')
    return response.data.data
  },
  async create(data: any): Promise<any> {
    const response = await api.post<ApiResponse<any>>('/admin/periods', data)
    return response.data.data
  },
  async update(id: number, data: any): Promise<any> {
    const response = await api.put<ApiResponse<any>>(`/admin/periods/${id}`, data)
    return response.data.data
  },
  async delete(id: number): Promise<void> {
    await api.delete(`/admin/periods/${id}`)
  },
  async activate(id: number): Promise<void> {
    await api.patch(`/admin/periods/${id}/activate`)
  }
}

export const managerService = {
  async getMyTeam() { return (await api.get('/manager/my-team')).data.data },
  async getTeamStatus() { return (await api.get('/manager/team-status')).data.data },
  async startEvaluation(data: any) { return (await api.post('/manager/evaluations/start', data)).data.data },
  async getEvaluationDetail(id: number) { return (await api.get(`/manager/evaluations/${id}`)).data.data },
  
  // Gunakan satu submitEvaluation saja
  async submitEvaluation(id: number, data: any) { 
    return (await api.put(`/manager/evaluations/${id}/submit`, data)).data 
  },

  // Fitur Sanggahan (Ubah apiClient menjadi api)
  resolveAppeal: async (id: number, data: { status: string }) => {
    const response = await api.put(`/manager/evaluations/${id}/resolve-appeal`, data)
    return response.data.data
  }
}

export const myPerformanceService = {
  async getHistory(): Promise<any[]> {
    const response = await api.get<ApiResponse<any[]>>('/employee/history')
    return response.data.data
  },
  async getDetail(id: number): Promise<any> {
    const response = await api.get<ApiResponse<any>>(`/employee/evaluations/${id}`)
    return response.data.data
  },
  async getLatest(): Promise<any> {
    const response = await api.get<ApiResponse<any>>('/employee/latest') 
    return response.data.data
  },
  async submitAppeal(id: number, data: FormData): Promise<any> {
    const response = await api.post<ApiResponse<any>>(`/employee/evaluations/${id}/appeal`, data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data.data
  }
}

export const positionService = {
  async getAll(): Promise<any[]> {
    const response = await api.get<ApiResponse<any[]>>('/admin/positions')
    return response.data.data
  },
  async create(data: any): Promise<any> {
    const response = await api.post<ApiResponse<any>>('/admin/positions', data)
    return response.data.data
  },
  async update(id: number, data: any): Promise<any> {
    const response = await api.put<ApiResponse<any>>(`/admin/positions/${id}`, data)
    return response.data.data
  },
  async delete(id: number): Promise<void> {
    await api.delete(`/admin/positions/${id}`)
  }
}

export const reportService = {
  async getEvaluationReport(periodId: number): Promise<any[]> {
    const response = await api.get<ApiResponse<any[]>>(`/admin/reports/evaluations?period_id=${periodId}`)
    return response.data.data
  },

  // [BARU] Komparasi 2 Periode
  async getPeriodComparison(periodA: number, periodB: number): Promise<any[]> {
    const response = await api.get<ApiResponse<any[]>>(`/admin/reports/comparison?period_a=${periodA}&period_b=${periodB}`)
    return response.data.data
  }
}

// [BARU] KPI Target Service (Goal Setting)
export const kpiTargetService = {
  // Manager: ambil target yang sudah diset untuk pegawai
  async getTargets(employeeId: number, periodId: number): Promise<any[]> {
    const response = await api.get<ApiResponse<any[]>>(`/manager/targets?employee_id=${employeeId}&period_id=${periodId}`)
    return response.data.data
  },

  // Manager: set target massal untuk pegawai
  async setTargetsBulk(data: { employee_id: number; period_id: number; targets: any[] }): Promise<any> {
    const response = await api.post<ApiResponse<any>>('/manager/targets/bulk', data)
    return response.data.data
  },

  // Manager: ambil indikator yang relevan untuk pegawai tertentu
  async getIndicatorsForTarget(employeeId: number): Promise<any[]> {
    const response = await api.get<ApiResponse<any[]>>(`/manager/targets/indicators?employee_id=${employeeId}`)
    return response.data.data
  },

  // Employee: lihat target sendiri
  async getMyTargets(periodId?: number): Promise<any[]> {
    const url = periodId ? `/employee/targets?period_id=${periodId}` : '/employee/targets'
    const response = await api.get<ApiResponse<any[]>>(url)
    return response.data.data
  }
}

export const adminService = {
  // Update fungsi ini untuk menerima parameter opsional
  async getActivityLogs(startDate?: string, endDate?: string): Promise<any[]> {
    // Buat Query String
    const params = new URLSearchParams()
    if (startDate) params.append('start_date', startDate)
    if (endDate) params.append('end_date', endDate)

    const response = await api.get<ApiResponse<any[]>>(`/admin/activity-logs?${params.toString()}`)
    return response.data.data
  },

  // [BARU] Statistik Dashboard Admin
  async getDashboardStats(): Promise<any> {
    const response = await api.get<ApiResponse<any>>('/admin/dashboard')
    return response.data.data
  },

  // [BARU] Statistik Kinerja Per Divisi
  async getDivisionStats(periodId?: number): Promise<any[]> {
    const url = periodId ? `/admin/divisions/stats?period_id=${periodId}` : '/admin/divisions/stats'
    const response = await api.get<ApiResponse<any[]>>(url)
    return response.data.data
  }
}

export const warningService = {
  // Menerbitkan SP
  async create(data: any): Promise<any> {
    const response = await api.post<ApiResponse<any>>('/manager/warnings', data) // Bisa pakai route manager/admin
    return response.data.data
  },

  // [BARU] Ambil SEMUA SP (Admin) dengan filter opsional
  async getAll(level?: string, employeeId?: number): Promise<any[]> {
    const params = new URLSearchParams()
    if (level) params.append('level', level)
    if (employeeId) params.append('employee_id', String(employeeId))
    const response = await api.get<ApiResponse<any[]>>(`/admin/warnings?${params.toString()}`)
    return response.data.data
  },

  // Melihat Riwayat SP Pegawai Tertentu
  async getByEmployee(employeeId: number): Promise<any[]> {
    const response = await api.get<ApiResponse<any[]>>(`/admin/employees/${employeeId}/warnings`)
    return response.data.data
  },

  // Hapus SP (Admin Only)
  async delete(id: number): Promise<void> {
    await api.delete(`/admin/warnings/${id}`)
  },

  async getMyWarnings(): Promise<any[]> {
    const response = await api.get<ApiResponse<any[]>>('/employee/warnings')
    return response.data.data
  }
}

export const notificationService = {
  async getMyNotifications(): Promise<any[]> {
    const response = await api.get<ApiResponse<any[]>>('/notifications')
    return response.data.data
  },
  async markAsRead(id: number): Promise<void> {
    await api.put(`/notifications/${id}/read`)
  },
  async markAllAsRead(): Promise<void> {
    await api.put('/notifications/read-all')
  }
}

export default api
