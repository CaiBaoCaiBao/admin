'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, MessageSquare, MapPin, Mountain, ImageIcon, BarChart3, TrendingUp } from "lucide-react"

export default function HomePage() {
  const stats = [
    {
      title: "总用户数",
      value: "1,234",
      change: "+12.5%",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
    },
    {
      title: "游记总数",
      value: "567",
      change: "+8.2%",
      icon: FileText,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
    },
    {
      title: "评论总数",
      value: "2,345",
      change: "+15.3%",
      icon: MessageSquare,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
    },
    {
      title: "目的地数",
      value: "89",
      change: "+5.1%",
      icon: MapPin,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">仪表盘</h1>
        <p className="text-muted-foreground">
          欢迎来到 Trip 管理后台，这里是系统概览
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
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
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {stat.change}
                </span>
                {" "}较上月
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 快捷操作 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {quickActions.map((action) => (
          <Card key={action.title} className="hover:shadow-md transition-shadow cursor-pointer">
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

      {/* 数据统计 */}
      <Card>
        <CardHeader>
          <CardTitle>数据统计</CardTitle>
          <CardDescription>
            查看系统各项数据的详细统计信息
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>图表组件待开发</p>
              <p className="text-sm">将显示用户增长、游记发布等趋势数据</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
