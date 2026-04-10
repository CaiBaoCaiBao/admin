'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, FileText, MessageSquare, MapPin, Mountain, ImageIcon, BarChart3, TrendingUp, RefreshCw } from "lucide-react"
import StatisticsApi from "@/api/statistics"
import type { StatisticsOverviewVO, StatisticsTrendVO } from "@/api/statistics"
import { toast } from "sonner"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export default function HomePage() {
    const router = useRouter()
    const [stats, setStats] = useState<StatisticsOverviewVO | null>(null)
    const [trendData, setTrendData] = useState<StatisticsTrendVO[]>([])
    const [loading, setLoading] = useState(true)
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1

    // 计算上个月
    let lastMonthYear = currentYear
    let lastMonth = currentMonth - 1
    if (lastMonth <= 0) {
        lastMonthYear -= 1
        lastMonth += 12
    }

    // 计算开始月份（往前推5个月，从上个月开始）
    let startYear = lastMonthYear
    let startMonth = lastMonth - 5
    if (startMonth <= 0) {
        startYear -= 1
        startMonth += 12
    }

    const [startYearState, setStartYearState] = useState(startYear)
    const [startMonthState, setStartMonthState] = useState(startMonth)
    const [endYearState, setEndYearState] = useState(currentYear)
    const [endMonthState, setEndMonthState] = useState(currentMonth)

    // 验证并限制时间范围
    const validateTimeRange = () => {
        // 结束时间不能超过当前月份
        if (endYearState > currentYear || (endYearState === currentYear && endMonthState > currentMonth)) {
            setEndYearState(currentYear)
            setEndMonthState(currentMonth)
        }
        // 起始时间不能超过上个月
        if (startYearState > lastMonthYear || (startYearState === lastMonthYear && startMonthState > lastMonth)) {
            setStartYearState(lastMonthYear)
            setStartMonthState(lastMonth)
        }
        // 起始时间不能晚于结束时间
        if (startYearState > endYearState || (startYearState === endYearState && startMonthState > endMonthState)) {
            setStartYearState(endYearState)
            setStartMonthState(endMonthState)
        }
    }

    // 当时间变化时验证
    useEffect(() => {
        validateTimeRange()
    }, [startYearState, startMonthState, endYearState, endMonthState])

    // 加载统计数据
    const loadStatistics = async () => {
        setLoading(true)
        try {
            const [overviewResponse, trendResponse] = await Promise.all([
                StatisticsApi.overview(),
                StatisticsApi.trendByRange(startYearState, startMonthState, endYearState, endMonthState)
            ])
            console.log('统计数据响应:', overviewResponse)
            console.log('趋势数据响应:', trendResponse)
            setStats(overviewResponse.data?.data || null)
            setTrendData(trendResponse.data?.data || [])
        } catch (error) {
            console.error('加载统计数据失败:', error)
            toast.error('加载统计数据失败')
        } finally {
            setLoading(false)
        }
    }

    // 当时间范围变化时重新加载趋势数据
    useEffect(() => {
        if (stats) {
            loadTrendData()
        }
    }, [startYearState, startMonthState, endYearState, endMonthState])

    // 单独加载趋势数据
    const loadTrendData = async () => {
        try {
            const trendResponse = await StatisticsApi.trendByRange(startYearState, startMonthState, endYearState, endMonthState)
            console.log('趋势数据响应:', trendResponse)
            setTrendData(trendResponse.data?.data || [])
        } catch (error) {
            console.error('加载趋势数据失败:', error)
            toast.error('加载趋势数据失败')
        }
    }

    useEffect(() => {
        loadStatistics()
    }, [])

    const statCards = [
        {
            title: "总用户数",
            value: stats?.totalUsers?.toLocaleString() || "0",
            icon: Users,
            color: "text-blue-600",
            bgColor: "bg-blue-100 dark:bg-blue-900/20",
        },
        {
            title: "游记总数",
            value: stats?.totalTravelNotes?.toLocaleString() || "0",
            icon: FileText,
            color: "text-green-600",
            bgColor: "bg-green-100 dark:bg-green-900/20",
        },
        {
            title: "评论总数",
            value: stats?.totalComments?.toLocaleString() || "0",
            icon: MessageSquare,
            color: "text-purple-600",
            bgColor: "bg-purple-100 dark:bg-purple-900/20",
        },
        {
            title: "目的地数",
            value: stats?.totalDestinations?.toLocaleString() || "0",
            icon: MapPin,
            color: "text-orange-600",
            bgColor: "bg-orange-100 dark:bg-orange-900/20",
        },
        {
            title: "景点数",
            value: stats?.totalAttractions?.toLocaleString() || "0",
            icon: Mountain,
            color: "text-red-600",
            bgColor: "bg-red-100 dark:bg-red-900/20",
        },
    ]

    const quickActions = [
        {
            title: "用户管理",
            description: "管理系统用户，查看用户信息",
            icon: Users,
            href: "/users",
            color: "bg-blue-500",
        },
        {
            title: "游记管理",
            description: "审核和管理用户游记",
            icon: FileText,
            href: "/travel-notes",
            color: "bg-green-500",
        },
        {
            title: "评论管理",
            description: "管理用户评论和反馈",
            icon: MessageSquare,
            href: "/comments",
            color: "bg-purple-500",
        },
        {
            title: "目的地管理",
            description: "管理旅游目的地信息",
            icon: MapPin,
            href: "/destinations",
            color: "bg-orange-500",
        },
        {
            title: "景点管理",
            description: "管理景点详细信息",
            icon: Mountain,
            href: "/attractions",
            color: "bg-red-500",
        },
        {
            title: "轮播图管理",
            description: "管理首页轮播图",
            icon: ImageIcon,
            href: "/banners",
            color: "bg-pink-500",
        },
    ]

    return (
        <div className="space-y-6">
            {/* 欢迎标题 */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">仪表盘</h1>
                    <p className="text-muted-foreground">
                        欢迎来到 Trip 管理后台，这里是系统概览
                    </p>
                </div>
                <Button onClick={loadStatistics} variant="outline" disabled={loading}>
                    <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    刷新数据
                </Button>
            </div>

            {/* 统计卡片 */}
            <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                {statCards.map((stat) => (
                    <Card key={stat.title}>
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
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* 快捷操作 */}
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {quickActions.map((action) => (
                    <Card
                        key={action.title}
                        className="hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => router.push(action.href)}
                    >
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className={`rounded-lg p-2 ${action.color}`}>
                                    <action.icon className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <CardTitle className="text-base">{action.title}</CardTitle>
                                    <CardDescription className="text-xs">
                                        {action.description}
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                    </Card>
                ))}
            </div>

            {/* 增长趋势 */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5" />
                                增长趋势
                            </CardTitle>
                            <CardDescription>
                                各项数据较上月增长情况
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Select value={startYearState.toString()} onValueChange={(value) => {
                                const year = parseInt(value)
                                if (year > lastMonthYear) {
                                    setStartYearState(lastMonthYear)
                                } else {
                                    setStartYearState(year)
                                }
                            }}>
                                <SelectTrigger className="w-[100px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                                        <SelectItem key={year} value={year.toString()}>{year}年</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={startMonthState.toString()} onValueChange={(value) => {
                                const month = parseInt(value)
                                if (startYearState === lastMonthYear && month > lastMonth) {
                                    setStartMonthState(lastMonth)
                                } else {
                                    setStartMonthState(month)
                                }
                            }}>
                                <SelectTrigger className="w-[80px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                                        <SelectItem key={month} value={month.toString()}>{month}月</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <span className="text-muted-foreground">至</span>
                            <Select value={endYearState.toString()} onValueChange={(value) => {
                                const year = parseInt(value)
                                if (year > currentYear) {
                                    setEndYearState(currentYear)
                                } else {
                                    setEndYearState(year)
                                }
                            }}>
                                <SelectTrigger className="w-[100px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                                        <SelectItem key={year} value={year.toString()}>{year}年</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={endMonthState.toString()} onValueChange={(value) => {
                                const month = parseInt(value)
                                if (endYearState === currentYear && month > currentMonth) {
                                    setEndMonthState(currentMonth)
                                } else {
                                    setEndMonthState(month)
                                }
                            }}>
                                <SelectTrigger className="w-[80px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                                        <SelectItem key={month} value={month.toString()}>{month}月</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={trendData.map(item => ({
                            month: item.month,
                            用户: item.userGrowthRate,
                            游记: item.travelNoteGrowthRate,
                            评论: item.commentGrowthRate,
                            目的地: item.destinationGrowthRate,
                            景点: item.attractionGrowthRate,
                        }))}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip
                                formatter={(value: number) => [`${value >= 0 ? '+' : ''}${value.toFixed(1)}%`, '增长率']}
                                contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #e5e7eb' }}
                            />
                            <Legend />
                            <Line type="monotone" dataKey="用户" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                            <Line type="monotone" dataKey="游记" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} />
                            <Line type="monotone" dataKey="评论" stroke="#a855f7" strokeWidth={2} dot={{ r: 4 }} />
                            <Line type="monotone" dataKey="目的地" stroke="#f97316" strokeWidth={2} dot={{ r: 4 }} />
                            <Line type="monotone" dataKey="景点" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    )
}
