import { request } from "@/config/axios"

// ==================== 类型定义 ====================

export interface QueryAttractionDTO {
    destinationId?: string
    name?: string
    status?: number
    pageNum?: number
    pageSize?: number
}

export interface CreateAttractionDTO {
    destinationId: string
    name: string
    description?: string
    coverImage?: string
    images?: string[]
    location?: string
    status?: number
}

export interface UpdateAttractionDTO {
    attractionId: string
    destinationId?: string
    name?: string
    description?: string
    coverImage?: string
    images?: string[]
    location?: string
    status?: number
}

export interface DeleteAttractionDTO {
    attractionIds: string[]
}

export interface AttractionVO {
    attractionId: string
    destinationId: string
    name: string
    description: string
    coverImage: string
    images: string[]
    location: string
    status: number
    createTime: string
    updateTime: string
}

// ==================== API 接口 ====================

const AttractionApi = {
    /**
     * 查询景点列表
     * GET /attraction/api/list
     */
    list: async (params: QueryAttractionDTO) => {
        return await request.get('/attraction/api/list', { params })
    },

    /**
     * 获取景点详情
     * GET /attraction/api/detail
     */
    detail: async (attractionId: string) => {
        return await request.get('/attraction/api/detail', { params: { attractionId } })
    },

    /**
     * 创建景点
     * POST /attraction/api/create
     */
    create: async (data: CreateAttractionDTO) => {
        return await request.post('/attraction/api/create', data)
    },

    /**
     * 更新景点
     * POST /attraction/api/update
     */
    update: async (data: UpdateAttractionDTO) => {
        return await request.post('/attraction/api/update', data)
    },

    /**
     * 批量删除景点
     * DELETE /attraction/api/delete
     */
    batchDelete: async (data: DeleteAttractionDTO) => {
        return await request.delete('/attraction/api/delete', { data })
    }
}

export default AttractionApi
