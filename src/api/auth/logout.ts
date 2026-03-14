import { request } from '@/config/axios'

// ==================== 类型定义 ====================

export interface LogoutResponse {
    success: boolean
    message: string
}

// ==================== 登出 API ====================

export const logout = async (): Promise<LogoutResponse> => {
    const response = await request.post('/auth/api/logout')
    return response.data
}
