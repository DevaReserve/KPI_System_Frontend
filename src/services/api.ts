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
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
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

export default api
