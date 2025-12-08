import axios from 'axios'
import type { ApiResponse, LoginRequest, LoginResponse, User, Division} from '@/types'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Jika error 401 (Unauthorized) dari backend
    if (error.response && error.response.status === 401) {
      // Hapus data lokal
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      
      // Paksa reload ke halaman login
      // Kita tidak pakai router.push agar state Pinia benar-benar bersih
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
// Auth service
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

  // Fungsi khusus untuk mengaktifkan periode
  async activate(id: number): Promise<void> {
    await api.patch(`/admin/periods/${id}/activate`)
  }
}

// MANAGER SERVICES
export const managerService = {
  async getTeamStatus(): Promise<any[]> {
    const response = await api.get<ApiResponse<any[]>>('/manager/team-status')
    return response.data.data
  },

  async startEvaluation(employeeId: number): Promise<{ evaluation_id: number }> {
    const response = await api.post<ApiResponse<any>>('/manager/evaluations/start', { employee_id: employeeId })
    return response.data.data
  },

  async getEvaluationDetail(id: number): Promise<any> {
    const response = await api.get<ApiResponse<any>>(`/manager/evaluations/${id}`)
    return response.data.data
  },

  // Kirim penilaian akhir
  async submitEvaluation(id: number, data: { feedback: string, scores: any[] }): Promise<any> {
    const response = await api.put<ApiResponse<any>>(`/manager/evaluations/${id}/submit`, data)
    return response.data.data
  }
}

export const myPerformanceService = {
  // Ambil riwayat semua penilaian yang sudah submit
  async getHistory(): Promise<any[]> {
    const response = await api.get<ApiResponse<any[]>>('/employee/history')
    return response.data.data
  },

  // Ambil detail satu penilaian lengkap
  async getDetail(id: number): Promise<any> {
    const response = await api.get<ApiResponse<any>>(`/employee/evaluations/${id}`)
    return response.data.data
  },

  async getLatest(): Promise<any> {
    // Endpoint ini sudah ada di Backend MyPerformanceController
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
  // Ambil data laporan berdasarkan ID Periode
  async getEvaluationReport(periodId: number): Promise<any[]> {
    // Kirim period_id sebagai query param
    const response = await api.get<ApiResponse<any[]>>(`/admin/reports/evaluations?period_id=${periodId}`)
    return response.data.data
  }
}
export default api
