'use client'

import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { toast } from 'sonner'
import { useRouter, useSearchParams } from 'next/navigation'
import AuthApi from '@/api/auth'
import { tokenService } from '@/config/axios'

// ==================== 类型定义 ====================

export interface LoginFormValues {
    userName: string
    password: string
    rememberMe: boolean
}

// ==================== Hook ====================

export function useAdminLogin() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm({
        defaultValues: {
            userName: '',
            password: '',
            rememberMe: false
        },
        onSubmit: async ({ value }) => {
            setIsLoading(true)
            
            try {
                const response = await AuthApi.login({
                    userName: value.userName,
                    key: value.password, // 后端使用 key 字段接收密码
                    loginMethod: 'password', // 密码登录方式
                    rememberMe: value.rememberMe
                })

                const { accessToken, refreshToken } = response.data.data

                // 保存 Token 到 localStorage
                tokenService.setAccessToken(accessToken)
                tokenService.setRefreshToken(refreshToken)

                // 保存 Token 到 cookie（供 middleware 使用）
                const maxAge = value.rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60 // 30天或1天
                document.cookie = `access_token=${accessToken}; path=/; max-age=${maxAge}; SameSite=Lax`
                document.cookie = `refresh_token=${refreshToken}; path=/; max-age=${maxAge}; SameSite=Lax`

                toast.success('登录成功')

                // 获取重定向路径，如果没有则跳转到首页
                const redirect = searchParams.get('redirect') || '/'
                router.push(redirect)
            } catch (error: any) {
                console.error('登录失败:', error)
                // 错误信息已在 axios 拦截器中处理
            } finally {
                setIsLoading(false)
            }
        }
    })

    return {
        form,
        isLoading
    }
}
