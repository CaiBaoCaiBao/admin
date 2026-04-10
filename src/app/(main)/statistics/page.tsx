'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, MessageSquare, MapPin, Mountain, RefreshCw, TrendingUp, Calendar, BarChart3 } from "lucide-react"
import StatisticsApi from "@/api/statistics"
import type { StatisticsOverviewVO } from "@/api/statistics"
import { toast } from "sonner"

export default function StatisticsPage() {
    const [stats, setStats] = useState<StatisticsOverviewVO | null>(null)
    const [loading, setLoading] = useState(true)
    const [mounted, setMounted] = useState(false)

    // 加载统计数据
    const loadStatistics = async () => {
        setLoading(true)
        try {
            const response = await StatisticsApi.overview()
            console.log('统计数据响应:', response)
            setStats(response.data?.data || null)
        } catch (error) {
            console.error('加载统计数据失败:', error)
            toast.error('加载统计数据失败')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        setMounted(true)
        loadStatistics()
    }, [])

    const statCards = [
        {
            title: "总用户数",
            value: stats?.totalUsers?.toLocaleString() || "0",
            icon: Users,
            color: "text-blue-600",
            bgColor: "bg-blue-100 dark:bg-blue-900/20",
            borderColor: "border-blue-200 dark:border-blue-800",
            trend: stats?.userGrowthRate ? `${stats.userGrowthRate >= 0 ? '+' : ''}${stats.userGrowthRate.toFixed(1)}%` : "0%",
            trendColor: stats?.userGrowthRate && stats.userGrowthRate >= 0 ? "text-green-600" : "text-red-600",
        },
        {
            title: "游记总数",
            value: stats?.totalTravelNotes?.toLocaleString() || "0",
            icon: FileText,
            color: "text-green-600",
            bgColor: "bg-green-100 dark:bg-green-900/20",
            borderColor: "border-green-200 dark:border-green-800",
            trend: stats?.travelNoteGrowthRate ? `${stats.travelNoteGrowthRate >= 0 ? '+' : ''}${stats.travelNoteGrowthRate.toFixed(1)}%` : "0%",
            trendColor: stats?.travelNoteGrowthRate && stats.travelNoteGrowthRate >= 0 ? "text-green-600" : "text-red-600",
        },
        {
            title: "评论总数",
            value: stats?.totalComments?.toLocaleString() || "0",
            icon: MessageSquare,
            color: "text-purple-600",
            bgColor: "bg-purple-100 dark:bg-purple-900/20",
            borderColor: "border-purple-200 dark:border-purple-800",
            trend: stats?.commentGrowthRate ? `${stats.commentGrowthRate >= 0 ? '+' : ''}${stats.commentGrowthRate.toFixed(1)}%` : "0%",
            trendColor: stats?.commentGrowthRate && stats.commentGrowthRate >= 0 ? "text-green-600" : "text-red-600",
        },
        {
            title: "目的地数",
            value: stats?.totalDestinations?.toLocaleString() || "0",
            icon: MapPin,
            color: "text-orange-600",
            bgColor: "bg-orange-100 dark:bg-orange-900/20",
            borderColor: "border-orange-200 dark:border-orange-800",
            trend: stats?.destinationGrowthRate ? `${stats.destinationGrowthRate >= 0 ? '+' : ''}${stats.destinationGrowthRate.toFixed(1)}%` : "0%",
            trendColor: stats?.destinationGrowthRate && stats.destinationGrowthRate >= 0 ? "text-green-600" : "text-red-600",
        },
        {
            title: "景点数",
            value: stats?.totalAttractions?.toLocaleString() || "0",
            icon: Mountain,
            color: "text-red-600",
            bgColor: "bg-red-100 dark:bg-red-900/20",
            borderColor: "border-red-200 dark:border-red-800",
            trend: stats?.attractionGrowthRate ? `${stats.attractionGrowthRate >= 0 ? '+' : ''}${stats.attractionGrowthRate.toFixed(1)}%` : "0%",
            trendColor: stats?.attractionGrowthRate && stats.attractionGrowthRate >= 0 ? "text-green-600" : "text-red-600",
        },
    ]

    // 模拟数据分布
    const dataDistribution = [
        { name: "用户", value: stats?.totalUsers || 0, color: "bg-blue-500" },
        { name: "游记", value: stats?.totalTravelNotes || 0, color: "bg-green-500" },
        { name: "评论", value: stats?.totalComments || 0, color: "bg-purple-500" },
        { name: "目的地", value: stats?.totalDestinations || 0, color: "bg-orange-500" },
        { name: "景点", value: stats?.totalAttractions || 0, color: "bg-red-500" },
    ]

    const maxValue = Math.max(...dataDistribution.map(d => d.value), 1)

    return (
        <div className="space-y-6">
            {/* 页面标题 */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">数据统计</h1>
                    <p className="text-muted-foreground">
                        查看系统各项数据的详细统计信息
                    </p>
                </div>
                <Button onClick={loadStatistics} variant="outline" disabled={loading}>
                    <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    刷新数据
                </Button>
            </div>

            {/* 统计卡片 */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                {statCards.map((stat) => (
                    <Card key={stat.title} className={`border-2 ${stat.borderColor}`}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {stat.title}
                            </CardTitle>
                            <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{loading ? '...' : stat.value}</div>
                            <div className="flex items-center text-xs mt-1">
                                <TrendingUp className={`h-3 w-3 mr-1 ${stat.trendColor}`} />
                                <span className={stat.trendColor}>{stat.trend}</span>
                                <span className="text-muted-foreground ml-1">较上月</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* 数据分布图表 */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* 数据分布 */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            数据分布
                        </CardTitle>
                        <CardDescription>
                            各类数据的数量分布情况
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {dataDistribution.map((item) => (
                                <div key={item.name} className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium">{item.name}</span>
                                        <span className="text-muted-foreground">
                                            {item.value.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${item.color} transition-all duration-500`}
                                            style={{ width: `${(item.value / maxValue) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* 数据概览 */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            数据概览
                        </CardTitle>
                        <CardDescription>
                            系统核心数据指标
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Users className="h-5 w-5 text-blue-600" />
                                    <div>
                                        <div className="text-sm font-medium">用户活跃度</div>
                                        <div className="text-xs text-muted-foreground">本月新增用户</div>
                                    </div>
                                </div>
                                <div className="text-2xl font-bold text-blue-600">
                                    {loading ? '...' : (stats?.monthlyNewUsers || 0).toLocaleString()}
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <FileText className="h-5 w-5 text-green-600" />
                                    <div>
                                        <div className="text-sm font-medium">内容产出</div>
                                        <div className="text-xs text-muted-foreground">本月新增游记</div>
                                    </div>
                                </div>
                                <div className="text-2xl font-bold text-green-600">
                                    {loading ? '...' : (stats?.monthlyNewTravelNotes || 0).toLocaleString()}
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <MessageSquare className="h-5 w-5 text-purple-600" />
                                    <div>
                                        <div className="text-sm font-medium">互动活跃</div>
                                        <div className="text-xs text-muted-foreground">本月新增评论</div>
                                    </div>
                                </div>
                                <div className="text-2xl font-bold text-purple-600">
                                    {loading ? '...' : (stats?.monthlyNewComments || 0).toLocaleString()}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 数据说明 */}
            <Card>
                <CardHeader>
                    <CardTitle>数据说明</CardTitle>
                    <CardDescription>
                        统计数据的计算方式和更新时间
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <h4 className="font-medium">统计指标</h4>
                            <ul className="space-y-1 text-sm text-muted-foreground">
                                <li>• <strong>总用户数</strong>：系统中注册的用户总数</li>
                                <li>• <strong>游记总数</strong>：已发布的游记数量（不含已删除）</li>
                                <li>• <strong>评论总数</strong>：所有评论的数量</li>
                                <li>• <strong>目的地数</strong>：已添加的目的地数量</li>
                                <li>• <strong>景点数</strong>：已添加的景点数量</li>
                            </ul>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-medium">更新说明</h4>
                            <ul className="space-y-1 text-sm text-muted-foreground">
                                <li>• 数据实时更新，点击"刷新数据"按钮可获取最新统计</li>
                                <li>• 增长率基于本月新增数据计算，反映较上月的变化趋势</li>
                                <li>• 统计数据仅管理员可见</li>
                                <li>• 数据统计时间：{mounted ? new Date().toLocaleString('zh-CN') : '加载中...'}</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
