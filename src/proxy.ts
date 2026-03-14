import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 不需要认证的路径
const publicPaths = ['/login', '/api/auth/login', '/api/auth/register']

// 检查路径是否为公开路径
const isPublicPath = (path: string): boolean => {
  return publicPaths.some(publicPath => path.startsWith(publicPath))
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // 如果是公开路径，直接放行
  if (isPublicPath(pathname)) {
    return NextResponse.next()
  }
  
  // 检查是否有 access_token
  const accessToken = request.cookies.get('access_token')?.value
  
  // 如果没有 token 且不是公开路径，重定向到登录页
  if (!accessToken) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }
  
  // 有 token，放行
  return NextResponse.next()
}

// 配置 middleware 匹配的路径
export const config = {
  matcher: [
    /*
     * 匹配所有路径除了:
     * - _next/static (静态文件)
     * - _next/image (图片优化)
     * - favicon.ico (网站图标)
     * - public 文件夹中的文件
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
