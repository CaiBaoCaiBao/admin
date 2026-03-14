'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import AuthApi from '@/api/auth'
import { tokenService } from '@/config/axios'

export function useLogout() {
    const router = useRouter()

    const logout = async () => {
        try {
            // 调用登出 API
            await AuthApi.logout()
        } catch (error) {
            console.error('登出失败:', error)
        } finally {
            // 无论 API 调用成功与否，都清除本地 token
            tokenService.clearAll()
            toast.success('已退出登录')
            
            // 跳转到登录页
            router.push('/login')
        }
    }

    return { logout }
}
