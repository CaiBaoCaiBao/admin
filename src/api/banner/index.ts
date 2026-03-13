import { request } from "@/config/axios"

// ==================== 类型定义 ====================

export interface QueryBannerDTO {
    page?: number
    pageSize?: number
    title?: string
    linkType?: number
    status?: number
}

export interface CreateBannerDTO {
    title: string
    image: string
    linkType: number
    linkId?: string
    sortOrder?: number
    status?: number
}

export interface UpdateBannerDTO {
    bannerId: string
    title?: string
    image?: string
    linkType?: number
    linkId?: string
    sortOrder?: number
    status?: number
}

export interface DeleteBannerDTO {
    bannerIds: string[]
}

export interface BannerVO {
    bannerId: string
    title: string
    image: string
    linkType: number
    linkId: string
    sortOrder: number
    status: number
    createTime: string
    updateTime: string
}

// ==================== API 接口 ====================

const BannerApi = {
    /**
     * 查询轮播图列表
     * GET /banner/admin-api/list
     */
    list: async (params: QueryBannerDTO) => {
        return await request.get('/banner/admin-api/list', { params })
    },

    /**
     * 创建轮播图
     * POST /banner/admin-api/create
     */
    create: async (data: CreateBannerDTO) => {
        return await request.post('/banner/admin-api/create', data)
    },

    /**
     * 更新轮播图
     * POST /banner/admin-api/update
     */
    update: async (data: UpdateBannerDTO) => {
        return await request.post('/banner/admin-api/update', data)
    },

    /**
     * 批量删除轮播图
     * DELETE /banner/admin-api/delete
     */
    batchDelete: async (data: DeleteBannerDTO) => {
        return await request.delete('/banner/admin-api/delete', { data })
    }
}

export default BannerApi
