import { request } from "@/config/axios"

// ==================== 类型定义 ====================

export interface AdminLoginDTO {
    userName: string
    password: string
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
    }
}

export default AuthApi
