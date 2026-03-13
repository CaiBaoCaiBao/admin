import { request } from "@/config/axios"

// ==================== 类型定义 ====================

export interface StatisticsOverviewVO {
    totalUsers: number
    totalTravelNotes: number
    totalComments: number
    totalDestinations: number
    totalAttractions: number
}

// ==================== API 接口 ====================

const StatisticsApi = {
    /**
     * 获取系统数据概况
     * GET /statistics/api/overview
     */
    overview: async () => {
        return await request.get<StatisticsOverviewVO>('/statistics/api/overview')
    }
}

export default StatisticsApi
