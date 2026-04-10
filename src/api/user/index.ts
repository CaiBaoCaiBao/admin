import { request } from "@/config/axios"

// ==================== 类型定义 ====================

export interface QueryUserListDTO {
    name?: string
    status?: string
    role?: string
    email?: string
    pageNum?: number
    pageSize?: number
}

export interface UpdateUserStatusDTO {
    uuid: string
    status: string
}

export interface ResetPasswordDTO {
    uuid: string
    newPassword: string
    confirmPassword: string
}

export interface DeleteUserDTO {
    uuids: string[]
}

export interface UserInfoVO {
    uuid: string
    userName: string
    email: string
    nickName: string
    avatar: string
    role: string
    status: string
    createTime?: string
    updateTime?: string
    createdAt?: string
    updatedAt?: string
}

// ==================== API 接口 ====================

const UserApi = {
    /**
     * 查询用户列表
     * GET /user/api/list
     */
    list: async (params: QueryUserListDTO) => {
        return await request.get('/user/api/list', { params })
    },

    /**
     * 查询用户详情
     * GET /user/api/info
     */
    detail: async (uid: string) => {
        return await request.get('/user/api/info', { params: { uid } })
    },

    /**
     * 更新用户状态
     * POST /user/api/update-status
     */
    updateStatus: async (data: UpdateUserStatusDTO) => {
        return await request.post('/user/api/update-status', data)
    },

    /**
     * 重置用户密码
     * POST /user/api/reset-password
     */
    resetPassword: async (data: ResetPasswordDTO) => {
        return await request.post('/user/api/reset-password', data)
    },

    /**
     * 批量删除用户
     * DELETE /user/admin-api/batch-delete
     */
    batchDelete: async (data: DeleteUserDTO) => {
        return await request.delete('/user/admin-api/batch-delete', { data })
    },

    /**
     * 获取用户总数
     * GET /user/api/count
     */
    count: async () => {
        return await request.get('/user/api/count')
    }
}

export default UserApi
