'use client'

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function AppHeader() {
  const pathname = usePathname()

  // 生成面包屑导航
  const generateBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean)
    
    if (segments.length === 0) {
      return <BreadcrumbPage>仪表盘</BreadcrumbPage>
    }

    return segments.map((segment, index) => {
      const href = '/' + segments.slice(0, index + 1).join('/')
      const isLast = index === segments.length - 1
      const title = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')

      return (
        <div key={href} className="flex items-center">
          {index > 0 && <BreadcrumbSeparator />}
          <BreadcrumbItem>
            {isLast ? (
              <BreadcrumbPage>{title}</BreadcrumbPage>
            ) : (
              <BreadcrumbLink href={href}>{title}</BreadcrumbLink>
            )}
          </BreadcrumbItem>
        </div>
      )
    })
  }

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">仪表盘</BreadcrumbLink>
            </BreadcrumbItem>
            {pathname !== '/' && generateBreadcrumbs()}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  )
}
