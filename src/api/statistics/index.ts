import { request } from "@/config/axios"

// ==================== 类型定义 ====================

export interface StatisticsOverviewVO {
    totalUsers: number
    totalTravelNotes: number
    totalComments: number
    totalDestinations: number
    totalAttractions: number
    monthlyNewUsers: number
    monthlyNewTravelNotes: number
    monthlyNewComments: number
    lastMonthlyNewUsers: number
    lastMonthlyNewTravelNotes: number
    lastMonthlyNewComments: number
    userGrowthRate: number
    travelNoteGrowthRate: number
    commentGrowthRate: number
    destinationGrowthRate: number
    attractionGrowthRate: number
}

export interface StatisticsTrendVO {
    month: string
    year: number
    monthValue: number
    userGrowthRate: number
    travelNoteGrowthRate: number
    commentGrowthRate: number
    destinationGrowthRate: number
    attractionGrowthRate: number
}

// ==================== API 接口 ====================

const StatisticsApi = {
    /**
     * 获取系统数据概况
     * GET /statistics/api/overview
     */
    overview: async () => {
        return await request.get<StatisticsOverviewVO>('/statistics/api/overview')
    },

    /**
     * 获取历史统计趋势（最近6个月）
     * GET /statistics/api/trend
     */
    trend: async () => {
        return await request.get<StatisticsTrendVO[]>('/statistics/api/trend')
    },

    /**
     * 获取指定时间范围的统计趋势
     * GET /statistics/api/trend/range
     */
    trendByRange: async (startYear: number, startMonth: number, endYear: number, endMonth: number) => {
        return await request.get<StatisticsTrendVO[]>('/statistics/api/trend/range', {
            params: { startYear, startMonth, endYear, endMonth }
        })
    }
}

export default StatisticsApi
