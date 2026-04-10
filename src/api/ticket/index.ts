import { request } from "@/config/axios"

// ==================== 类型定义 ====================

export interface QueryTicketDTO {
    attractionId?: string
    playItemId?: string
    ticketType?: string
    pageNum?: number
    pageSize?: number
}

export interface CreateTicketDTO {
    attractionId: string
    playItemId?: string
    ticketName: string
    ticketCode?: string
    ticketType?: string
    price?: number
    discountPrice?: number
    stock?: number
    validDays?: number
    description?: string
    sortOrder?: number
    status?: number
}

export interface UpdateTicketDTO {
    tid: string
    attractionId?: string
    playItemId?: string
    ticketName?: string
    ticketCode?: string
    ticketType?: string
    price?: number
    discountPrice?: number
    stock?: number
    validDays?: number
    description?: string
    sortOrder?: number
    status?: number
}

export interface DeleteTicketDTO {
    tids: string[]
}

export interface TicketVO {
    id: number
    tid: string
    attractionId: string
    playItemId: string | null
    ticketName: string
    ticketCode: string | null
    ticketType: string | null
    price: number | null
    discountPrice: number | null
    stock: number | null
    validDays: number | null
    description: string | null
    sortOrder: number | null
    status: number | null
    createdAt: string
    updatedAt: string
}

// ==================== API 接口 ====================

const TicketApi = {
    /**
     * 查询门票列表
     * GET /ticket/api/list
     */
    list: async (params: QueryTicketDTO) => {
        return await request.get('/ticket/api/list', { params })
    },

    /**
     * 创建门票
     * POST /ticket/api/create
     */
    create: async (data: CreateTicketDTO) => {
        return await request.post('/ticket/api/create', data)
    },

    /**
     * 更新门票
     * POST /ticket/api/update
     */
    update: async (data: UpdateTicketDTO) => {
        return await request.post('/ticket/api/update', data)
    },

    /**
     * 批量删除门票
     * DELETE /ticket/api/delete
     */
    batchDelete: async (data: DeleteTicketDTO) => {
        return await request.delete('/ticket/api/delete', { data })
    }
}

export default TicketApi
