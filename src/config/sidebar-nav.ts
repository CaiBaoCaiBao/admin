import {
  LayoutDashboard,
  Users,
  FileText,
  MessageSquare,
  MapPin,
  Mountain,
  Image as ImageIcon,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react"

export interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
}

export interface NavGroup {
  title: string
  items: NavItem[]
}

export const navGroups: NavGroup[] = [
  {
    title: "主要功能",
    items: [
      {
        title: "仪表盘",
        href: "/",
        icon: LayoutDashboard,
      },
      {
        title: "用户管理",
        href: "/users",
        icon: Users,
      },
      {
        title: "游记管理",
        href: "/travel-notes",
        icon: FileText,
      },
      {
        title: "评论管理",
        href: "/comments",
        icon: MessageSquare,
      },
    ],
  },
  {
    title: "内容管理",
    items: [
      {
        title: "目的地管理",
        href: "/destinations",
        icon: MapPin,
      },
      {
        title: "景点管理",
        href: "/attractions",
        icon: Mountain,
      },
      {
        title: "轮播图管理",
        href: "/banners",
        icon: ImageIcon,
      },
    ],
  },
  {
    title: "系统",
    items: [
      {
        title: "数据统计",
        href: "/statistics",
        icon: BarChart3,
      },
      {
        title: "系统设置",
        href: "/settings",
        icon: Settings,
      },
    ],
  },
]

export const footerNavItems: NavItem[] = [
  {
    title: "退出登录",
    href: "/login",
    icon: LogOut,
  },
]
