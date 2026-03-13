import { request } from "@/config/axios"

// ==================== 类型定义 ====================

export interface QueryTravelNoteDTO {
    noteId?: string
    userId?: string
    destinationId?: string
    title?: string
    status?: number
    pageNum?: number
    pageSize?: number
}

export interface AuditTravelNoteDTO {
    noteIds: string[]
    status: number
    rejectReason?: string
}

export interface SetTopTravelNoteDTO {
    noteId: string
    isTop: boolean
}

export interface DeleteTravelNoteDTO {
    noteIds: string[]
}

export interface TravelNoteVO {
    noteId: string
    userId: string
    destinationId: string
    title: string
    content: string
    images: string[]
    status: number
    isTop: boolean
    viewCount: number
    likeCount: number
    commentCount: number
    createTime: string
    updateTime: string
}

// ==================== API 接口 ====================

const TravelNoteApi = {
    /**
     * 查询游记列表
     * GET /travel-note/api/list
     */
    list: async (params: QueryTravelNoteDTO) => {
        return await request.get('/travel-note/api/list', { params })
    },

    /**
     * 获取游记详情
     * GET /travel-note/api/detail
     */
    detail: async (noteId: string) => {
        return await request.get('/travel-note/api/detail', { params: { noteId } })
    },

    /**
     * 审核游记
     * POST /travel-note/admin-api/audit
     */
    audit: async (data: AuditTravelNoteDTO) => {
        return await request.post('/travel-note/admin-api/audit', data)
    },

    /**
     * 置顶/取消置顶游记
     * POST /travel-note/admin-api/set-top
     */
    setTop: async (data: SetTopTravelNoteDTO) => {
        return await request.post('/travel-note/admin-api/set-top', data)
    },

    /**
     * 批量删除游记
     * DELETE /travel-note/api/delete
     */
    batchDelete: async (data: DeleteTravelNoteDTO) => {
        return await request.delete('/travel-note/api/delete', { data })
    }
}

export default TravelNoteApi
