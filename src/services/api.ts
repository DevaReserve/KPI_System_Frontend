import axios from 'axios'
import type { ApiResponse, LoginRequest, LoginResponse, User, Division} from '@/types'

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
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
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
    const response = await api.get<ApiResponse<any[]>>('/admin/periods')
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
  async submitEvaluation(id: number, data: any) { return (await api.put(`/manager/evaluations/${id}/submit`, data)).data }
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
  }
}

export default api
