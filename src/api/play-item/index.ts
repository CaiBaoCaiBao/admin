import { request } from "@/config/axios"

// ==================== 类型定义 ====================

export interface QueryPlayItemDTO {
    attractionId?: string
    name?: string
    pageNum?: number
    pageSize?: number
}

export interface CreatePlayItemDTO {
    attractionId: string
    name: string
    images?: string[]
    description?: string
    duration?: number
    maxPerson?: number
    minPerson?: number
    minAge?: number
    maxAge?: number
    price?: number
    discountPrice?: number
    status?: number
}

export interface UpdatePlayItemDTO {
    id: number
    attractionId?: string
    name?: string
    images?: string[]
    description?: string
    duration?: number
    maxPerson?: number
    minPerson?: number
    minAge?: number
    maxAge?: number
    price?: number
    discountPrice?: number
    status?: number
}

export interface DeletePlayItemDTO {
    piids: string[]
}

export interface PlayItemVO {
    id: number
    piid: string
    aid: string
    name: string
    images: string[] | null
    description: string | null
    duration: number | null
    maxPerson: number | null
    minPerson: number | null
    minAge: number | null
    maxAge: number | null
    price: number | null
    discountPrice: number | null
    status: number | null
    createdAt: string
    updatedAt: string
}

// ==================== API 接口 ====================

const PlayItemApi = {
    /**
     * 查询游玩项目列表
     * GET /play-item/api/list
     */
    list: async (params: QueryPlayItemDTO) => {
        return await request.get('/play-item/api/list', { params })
    },

    /**
     * 创建游玩项目
     * POST /play-item/api/create
     */
    create: async (data: CreatePlayItemDTO) => {
        return await request.post('/play-item/api/create', data)
    },

    /**
     * 更新游玩项目
     * POST /play-item/api/update
     */
    update: async (data: UpdatePlayItemDTO) => {
        return await request.post('/play-item/api/update', data)
    },

    /**
     * 批量删除游玩项目
     * DELETE /play-item/api/delete
     */
    batchDelete: async (data: DeletePlayItemDTO) => {
        return await request.delete('/play-item/api/delete', { data })
    }
}

export default PlayItemApi
