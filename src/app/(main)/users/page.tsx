'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Search, Power, PowerOff, Key, Trash2, RefreshCw } from "lucide-react"
import UserApi from "@/api/user"
import type { QueryUserListDTO, UserInfoVO, UpdateUserStatusDTO, ResetPasswordDTO } from "@/api/user"

const STATUS_MAP: Record<string, { label: string; variant: "default" | "destructive" }> = {
    "inactive": { label: "禁用", variant: "destructive" },
    "active": { label: "启用", variant: "default" },
}

const ROLE_MAP: Record<string, { label: string; color: string }> = {
    "user": { label: "普通用户", color: "bg-blue-100 text-blue-800" },
    "admin": { label: "管理员", color: "bg-purple-100 text-purple-800" },
}

export default function UsersPage() {
    const [users, setUsers] = useState<UserInfoVO[]>([])
    const [loading, setLoading] = useState(false)
    const [searchParams, setSearchParams] = useState<QueryUserListDTO>({
        pageNum: 1,
        pageSize: 10,
    })
    const [total, setTotal] = useState(0)

    // 对话框状态
    const [statusDialogOpen, setStatusDialogOpen] = useState(false)
    const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<UserInfoVO | null>(null)
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    // 加载用户列表
    const loadUsers = async () => {
        setLoading(true)
        try {
            const response = await UserApi.list(searchParams)
            console.log('用户列表响应:', response)

            const data = response.data?.data
            if (data) {
                if (data.records && Array.isArray(data.records)) {
                    console.log('用户记录:', data.records)
                    console.log('第一条记录的 uUid:', data.records[0]?.uUid)
                    setUsers(data.records)
                    setTotal(data.total || 0)
                } else if (Array.isArray(data)) {
                    console.log('用户数组:', data)
                    console.log('第一条记录的 uUid:', data[0]?.uUid)
                    setUsers(data)
                    setTotal(data.length)
                } else {
                    setUsers([])
                    setTotal(0)
                }
            } else {
                setUsers([])
                setTotal(0)
            }
        } catch (error) {
            console.error('加载用户列表失败:', error)
            setUsers([])
            setTotal(0)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadUsers()
    }, [searchParams])

    // 防抖搜索
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
    const emailDebounceTimerRef = useRef<NodeJS.Timeout | null>(null)

    const handleSearch = useCallback(() => {
        setSearchParams({ ...searchParams, pageNum: 1 })
    }, [searchParams])

    const handleSearchInput = useCallback((value: string) => {
        // 立即更新输入框的值
        setSearchParams(prev => ({ ...prev, name: value }))

        // 防抖触发搜索
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current)
        }
        debounceTimerRef.current = setTimeout(() => {
            setSearchParams(prev => ({ ...prev, pageNum: 1 }))
        }, 500)
    }, [])

    const handleEmailInput = useCallback((value: string) => {
        // 立即更新输入框的值
        setSearchParams(prev => ({ ...prev, email: value }))

        // 防抖触发搜索
        if (emailDebounceTimerRef.current) {
            clearTimeout(emailDebounceTimerRef.current)
        }
        emailDebounceTimerRef.current = setTimeout(() => {
            setSearchParams(prev => ({ ...prev, pageNum: 1 }))
        }, 500)
    }, [])

    // 重置搜索
    const handleReset = () => {
        setSearchParams({
            name: '',
            status: undefined,
            role: undefined,
            email: '',
            pageNum: 1,
            pageSize: 10,
        })
        loadUsers()
    }

    // 切换用户状态
    const handleToggleStatus = (user: UserInfoVO) => {
        setSelectedUser(user)
        setStatusDialogOpen(true)
    }

    const confirmToggleStatus = async () => {
        if (!selectedUser) return

        const newStatus = selectedUser.status === 'active' ? 'inactive' : 'active'
        const data: UpdateUserStatusDTO = {
            uuid: selectedUser.uuid,
            status: newStatus,
        }

        console.log('选中的用户:', selectedUser)
        console.log('发送的数据:', data)

        try {
            await UserApi.updateStatus(data)
            toast.success(`用户已${newStatus === 'active' ? '启用' : '禁用'}`)
            setStatusDialogOpen(false)
            await loadUsers()
        } catch (error: any) {
            console.error('更新用户状态失败:', error)
            const errorMessage = error?.response?.data?.message || error?.message || '更新用户状态失败'
            toast.error(errorMessage)
        }
    }

    // 重置密码
    const handleResetPassword = (user: UserInfoVO) => {
        setSelectedUser(user)
        setNewPassword('')
        setConfirmPassword('')
        setPasswordDialogOpen(true)
    }

    const confirmResetPassword = async () => {
        if (!selectedUser) return

        if (!newPassword || newPassword.length < 6) {
            toast.error('密码长度不能少于6位')
            return
        }

        if (newPassword !== confirmPassword) {
            toast.error('两次输入的密码不一致')
            return
        }

        const data: ResetPasswordDTO = {
            uuid: selectedUser.uuid,
            newPassword,
            confirmPassword,
        }

        try {
            await UserApi.resetPassword(data)
            toast.success('密码重置成功')
            setPasswordDialogOpen(false)
        } catch (error) {
            console.error('重置密码失败:', error)
        }
    }

    // 删除用户
    const handleDelete = async (user: UserInfoVO) => {
        if (!confirm(`确定要删除用户 "${user.nickName || user.userName}" 吗？`)) return

        try {
            await UserApi.batchDelete({ uuids: [user.uuid] })
            toast.success('删除成功')
            await loadUsers()
        } catch (error) {
            console.error('删除用户失败:', error)
        }
    }

    // 清理定时器
    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current)
            }
        }
    }, [])

    return (
        <div className="space-y-6">
            {/* 页面标题 */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">用户管理</h1>
                    <p className="text-muted-foreground">
                        管理系统用户，查看用户信息
                    </p>
                </div>
                <Button onClick={loadUsers} variant="outline">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    刷新
                </Button>
            </div>

            {/* 搜索卡片 */}
            <Card>
                <CardHeader>
                    <CardTitle>搜索条件</CardTitle>
                    <CardDescription>根据条件筛选用户</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4 items-end flex-wrap">
                        <div className="flex-1 min-w-[200px]">
                            <Label htmlFor="search-name">用户名/昵称</Label>
                            <Input
                                id="search-name"
                                placeholder="请输入用户名或昵称"
                                value={searchParams.name || ''}
                                onChange={(e) => handleSearchInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                        </div>
                        <div className="w-48">
                            <Label htmlFor="search-email">邮箱</Label>
                            <Input
                                id="search-email"
                                placeholder="请输入邮箱"
                                value={searchParams.email || ''}
                                onChange={(e) => handleEmailInput(e.target.value)}
                            />
                        </div>
                        <div className="w-48">
                            <Label htmlFor="search-status">状态</Label>
                            <select
                                id="search-status"
                                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                                value={searchParams.status || 'all'}
                                onChange={(e) =>
                                    setSearchParams({
                                        ...searchParams,
                                        status: e.target.value === 'all' ? undefined : e.target.value
                                    })
                                }
                            >
                                <option value="all">全部状态</option>
                                <option value="active">启用</option>
                                <option value="inactive">禁用</option>
                            </select>
                        </div>
                        <div className="w-48">
                            <Label htmlFor="search-role">角色</Label>
                            <select
                                id="search-role"
                                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                                value={searchParams.role || 'all'}
                                onChange={(e) =>
                                    setSearchParams({
                                        ...searchParams,
                                        role: e.target.value === 'all' ? undefined : e.target.value
                                    })
                                }
                            >
                                <option value="all">全部角色</option>
                                <option value="user">普通用户</option>
                                <option value="admin">管理员</option>
                            </select>
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={handleSearch}>
                                <Search className="mr-2 h-4 w-4" />
                                搜索
                            </Button>
                            <Button variant="outline" onClick={handleReset}>
                                重置
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 用户列表 */}
            <Card>
                <CardHeader>
                    <CardTitle>用户列表</CardTitle>
                    <CardDescription>
                        共 {total} 条记录
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>用户名</TableHead>
                                <TableHead>昵称</TableHead>
                                <TableHead>邮箱</TableHead>
                                <TableHead>角色</TableHead>
                                <TableHead>状态</TableHead>
                                <TableHead>注册时间</TableHead>
                                <TableHead className="text-right">操作</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow key="loading">
                                    <TableCell colSpan={7} className="text-center">
                                        加载中...
                                    </TableCell>
                                </TableRow>
                            ) : users.length === 0 ? (
                                <TableRow key="empty">
                                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                                        暂无数据
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((user) => (
                                    <TableRow key={user.uUid || user.userName || user.email}>
                                        <TableCell className="font-medium">{user.userName}</TableCell>
                                        <TableCell>{user.nickName || '-'}</TableCell>
                                        <TableCell>{user.email || '-'}</TableCell>
                                        <TableCell>
                                            <Badge className={ROLE_MAP[user.role]?.color || 'bg-gray-100 text-gray-800'}>
                                                {ROLE_MAP[user.role]?.label || user.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={STATUS_MAP[user.status]?.variant}>
                                                {STATUS_MAP[user.status]?.label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {user.createTime ? new Date(user.createTime).toLocaleDateString('zh-CN') : (user.createdAt ? new Date(user.createdAt).toLocaleDateString('zh-CN') : '-')}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    key="toggle-status"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleToggleStatus(user)}
                                                    title={user.status === 'active' ? '禁用用户' : '启用用户'}
                                                >
                                                    {user.status === 'active' ? (
                                                        <Power className="h-4 w-4" />
                                                    ) : (
                                                        <PowerOff className="h-4 w-4" />
                                                    )}
                                                </Button>
                                                <Button
                                                    key="reset-password"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleResetPassword(user)}
                                                    title="重置密码"
                                                >
                                                    <Key className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    key="delete"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(user)}
                                                    title="删除用户"
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* 切换状态确认对话框 */}
            <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>确认{selectedUser?.status === 'active' ? '禁用' : '启用'}用户</DialogTitle>
                        <DialogDescription>
                            确定要{selectedUser?.status === 'active' ? '禁用' : '启用'}用户 "{selectedUser?.nickName || selectedUser?.userName}" 吗？
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
                            取消
                        </Button>
                        <Button onClick={confirmToggleStatus}>
                            确认
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* 重置密码对话框 */}
            <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>重置用户密码</DialogTitle>
                        <DialogDescription>
                            为用户 "{selectedUser?.nickName || selectedUser?.userName}" 设置新密码
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="new-password">新密码 *</Label>
                            <Input
                                id="new-password"
                                type="password"
                                placeholder="请输入新密码（至少6位）"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirm-password">确认密码 *</Label>
                            <Input
                                id="confirm-password"
                                type="password"
                                placeholder="请再次输入新密码"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setPasswordDialogOpen(false)}>
                            取消
                        </Button>
                        <Button onClick={confirmResetPassword}>
                            确认重置
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
