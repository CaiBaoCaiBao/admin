import { request } from "@/config/axios"
import { logout as logoutApi } from './logout'

// ==================== 类型定义 ====================

export interface AdminLoginDTO {
    userName: string
    key: string
    loginMethod: string
    rememberMe: boolean
}

// ==================== API 接口 ====================

const AuthApi = {
    /**
     * 管理员登录
     * POST /auth/api/login
     */
    login: async (data: AdminLoginDTO) => {
        return await request.post('/auth/api/login', data)
    },

    /**
     * 获取当前用户个人资料详情
     * GET /user/api/my-profile
     */
    getMyProfile: async () => {
        return await request.get('/user/api/my-profile')
    },

    /**
     * 登出
     * POST /auth/api/logout
     */
    logout: async () => {
        return await logoutApi()
    }
}

export default AuthApi
