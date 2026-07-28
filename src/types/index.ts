// User types
export interface User {
  id: number
  username: string
  email: string
  role: 'admin' | 'manager' | 'employee'
  is_executive?: boolean;
  is_active: boolean
  last_login: string
  created_at: string
  employee?: Employee
}

export interface Employee {
  id: number
  nip: string
  name: string
  email: string
  division_id: number
  position: string
  direct_supervisor_id?: number
  is_active: boolean
  join_date: string
  created_at: string
  updated_at: string
  profile_picture_url?: string;
}

export interface Achievement {
  id: number;
  employee_id: number;
  title: string;
  description: string;
  date: string;     // Format YYYY-MM-DD
  file_url: string;
  created_at: string;
}

export interface Division {
  id: number
  name: string
  description: string
  manager_id?: number
  manager_name?: string
  employee_count?: number 
}

// Auth types
export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  user: User
}

// Evaluation types
export interface PerformanceIndicator {
  id: number
  name: string
  description: string
  indicator_type: 'umum' | 'spesifik'
  weight: number
  division_id?: number
  division?: { 
    id: number
    name: string
  }
}

export interface Evaluation {
  id: number
  employee_id: number
  evaluator_id: number
  period_id: number
  total_score: number
  feedback: string
  status: 'draft' | 'submitted'
  submitted_at?: string
  employee_name?: string
  evaluator_name?: string
  period_name?: string
}

export interface EvaluationScore {
  id: number
  evaluation_id: number
  indicator_id: number
  score: number
  converted_score: number
  notes: string
  indicator?: PerformanceIndicator
}

export interface EvaluationPeriod {
  id: number
  name: string
  start_date: string
  end_date: string
  is_active: boolean
}

export interface DivisionDetail {
  id: number
  name: string
  description: string
  manager_id: number
  manager_name: string
  employee_count: number
}

export interface EmployeeDetail {
  id: number
  nip: string
  name: string
  email: string
  division_id: number
  division_name: string
  position: string
  direct_supervisor_id?: number
  supervisor_name: string
  is_active: boolean
  join_date: string
}

export interface ActivityLog {
  id: number
  user_id?: number
  username?: string
  action: string
  description: string
  ip_address: string
  created_at: string
  user?: {
    username: string
    role: string
  }
}

// API Response types
export interface ApiResponse<T = any> {
  status: number
  message: string
  data: T
}

export interface PaginatedResponse<T = any> {
  data: T[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}
