import { request } from "@/config/axios"

// ==================== 类型定义 ====================

export interface QueryCommentDTO {
    targetType: string
    targetId: string
    page?: number
    pageSize?: number
}

export interface DeleteCommentDTO {
    commentIds: string[]
}

export interface CommentVO {
    commentId: string
    userId: string
    targetType: string
    targetId: string
    content: string
    createTime: string
    updateTime: string
}

// ==================== API 接口 ====================

const CommentApi = {
    /**
     * 查询评论列表
     * GET /comment/api/list
     */
    list: async (params: QueryCommentDTO) => {
        return await request.get('/comment/api/list', { params })
    },

    /**
     * 删除评论
     * DELETE /comment/api/delete
     */
    delete: async (data: DeleteCommentDTO) => {
        return await request.delete('/comment/api/delete', { data })
    },

    /**
     * 获取评论总数
     * GET /comment/api/count
     */
    count: async () => {
        return await request.get('/comment/api/count')
    }
}

export default CommentApi
