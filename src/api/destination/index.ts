import { request } from "@/config/axios"

// ==================== 类型定义 ====================

export interface QueryDestinationDTO {
    name?: string
    province?: string
    city?: string
    status?: number
    pageNum?: number
    pageSize?: number
}

export interface CreateDestinationDTO {
    name: string
    aliasesName?: string
    description?: string
    coverImg?: string
    province?: string
    city?: string
    level?: number
    bestSeason?: string
    travelDays?: number
    status?: number
    sortOrder?: number
}

export interface UpdateDestinationDTO {
    destinationId: string
    name?: string
    aliasesName?: string
    description?: string
    coverImg?: string
    province?: string
    city?: string
    level?: number
    bestSeason?: string
    travelDays?: number
    status?: number
    sortOrder?: number
}

export interface DeleteDestinationDTO {
    destinationIds: string[]
}

export interface DestinationVO {
    destinationId: string
    name: string
    aliasesName?: string
    coverImg?: string
    description?: string
    province?: string
    city?: string
    level?: number
    bestSeason?: string
    travelDays?: number
    viewCount?: number
    status?: number
    sortOrder?: number
}

export interface PageResult<T> {
    records: T[]
    total: number
    page: number
    pageSize: number
}

// ==================== API 接口 ====================

const DestinationApi = {
    /**
     * 查询目的地列表
     * GET /destination/api/list
     */
    list: async (params: QueryDestinationDTO) => {
        return await request.get('/destination/api/list', { params })
    },

    /**
     * 获取目的地详情
     * GET /destination/api/detail
     */
    detail: async (destinationId: string) => {
        return await request.get('/destination/api/detail', { params: { destinationId } })
    },

    /**
     * 创建目的地
     * POST /destination/api/create
     */
    create: async (data: CreateDestinationDTO) => {
        return await request.post('/destination/api/create', data)
    },

    /**
     * 更新目的地
     * POST /destination/api/update
     */
    update: async (data: UpdateDestinationDTO) => {
        return await request.post('/destination/api/update', data)
    },

    /**
     * 批量删除目的地
     * DELETE /destination/api/delete
     */
    batchDelete: async (data: DeleteDestinationDTO) => {
        return await request.delete('/destination/api/delete', { data })
    }
}

export default DestinationApi
