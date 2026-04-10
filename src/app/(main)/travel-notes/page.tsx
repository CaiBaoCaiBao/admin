'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Search, Eye, Check, X, Trash2, RefreshCw, MoreHorizontal } from "lucide-react"
import TravelNoteApi from "@/api/travel-note"
import type { QueryTravelNoteDTO, TravelNoteVO, AuditTravelNoteDTO } from "@/api/travel-note"

const STATUS_MAP: Record<number, { label: string; variant: "default" | "secondary" | "destructive" }> = {
    "-1": { label: "草稿", variant: "secondary" },
    0: { label: "待审核", variant: "secondary" },
    1: { label: "审核通过", variant: "default" },
    2: { label: "已驳回", variant: "destructive" },
}

export default function TravelNotesPage() {
    const [travelNotes, setTravelNotes] = useState<TravelNoteVO[]>([])
    const [loading, setLoading] = useState(false)
    const [searchParams, setSearchParams] = useState<QueryTravelNoteDTO>({
        pageNum: 1,
        pageSize: 10,
    })
    const [total, setTotal] = useState(0)

    // 对话框状态
    const [auditDialogOpen, setAuditDialogOpen] = useState(false)
    const [detailDialogOpen, setDetailDialogOpen] = useState(false)
    const [selectedNote, setSelectedNote] = useState<TravelNoteVO | null>(null)
    const [rejectReason, setRejectReason] = useState('')

    // 加载游记列表
    const loadTravelNotes = async () => {
        setLoading(true)
        try {
            const response = await TravelNoteApi.list(searchParams)
            console.log('游记列表响应:', response)

            const data = response.data?.data
            if (data) {
                if (data.records && Array.isArray(data.records)) {
                    setTravelNotes(data.records)
                    setTotal(data.total || 0)
                } else if (Array.isArray(data)) {
                    setTravelNotes(data)
                    setTotal(data.length)
                } else {
                    setTravelNotes([])
                    setTotal(0)
                }
            } else {
                setTravelNotes([])
                setTotal(0)
            }
        } catch (error) {
            console.error('加载游记列表失败:', error)
            setTravelNotes([])
            setTotal(0)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadTravelNotes()
    }, [searchParams])

    // 防抖搜索
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

    const handleSearch = useCallback(() => {
        setSearchParams({ ...searchParams, pageNum: 1 })
    }, [searchParams])

    const handleSearchInput = useCallback((value: string) => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current)
        }
        debounceTimerRef.current = setTimeout(() => {
            setSearchParams(prev => ({ ...prev, title: value, pageNum: 1 }))
        }, 500)
    }, [])

    // 重置搜索
    const handleReset = () => {
        setSearchParams({
            title: '',
            status: undefined,
            pageNum: 1,
            pageSize: 10,
        })
        loadTravelNotes()
    }

    // 查看详情
    const handleViewDetail = async (note: TravelNoteVO) => {
        try {
            const response = await TravelNoteApi.detail(note.noteId)
            const detailData = response.data?.data || note

            // 解析 images 字段（可能是 JSON 字符串）
            if (detailData.images && typeof detailData.images === 'string') {
                try {
                    detailData.images = JSON.parse(detailData.images)
                } catch (e) {
                    console.error('解析 images 失败:', e)
                    detailData.images = []
                }
            }

            setSelectedNote(detailData)
            setDetailDialogOpen(true)
        } catch (error) {
            console.error('获取游记详情失败:', error)
        }
    }

    // 审核游记
    const handleAudit = (note: TravelNoteVO, auditStatus: number) => {
        setSelectedNote(note)
        if (auditStatus === 3) {
            // 驳回需要填写原因
            setRejectReason('')
            setAuditDialogOpen(true)
        } else {
            // 直接通过
            performAudit(note.noteId, auditStatus)
        }
    }

    const performAudit = async (noteId: string, status: number) => {
        const data: AuditTravelNoteDTO = {
            noteIds: [noteId],
            status,
            rejectReason: status === 3 ? rejectReason : undefined,
        }

        try {
            await TravelNoteApi.audit(data)
            toast.success(status === 2 ? '审核通过' : '审核驳回')
            setAuditDialogOpen(false)
            await loadTravelNotes()
        } catch (error) {
            console.error('审核失败:', error)
        }
    }

    // 删除游记
    const handleDelete = async (note: TravelNoteVO) => {
        if (!confirm(`确定要删除游记 "${note.title}" 吗？`)) return

        try {
            await TravelNoteApi.batchDelete({ noteIds: [note.noteId] })
            toast.success('删除成功')
            await loadTravelNotes()
        } catch (error) {
            console.error('删除游记失败:', error)
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
                    <h1 className="text-3xl font-bold tracking-tight">游记管理</h1>
                    <p className="text-muted-foreground">
                        审核和管理用户游记
                    </p>
                </div>
                <Button onClick={loadTravelNotes} variant="outline">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    刷新
                </Button>
            </div>

            {/* 搜索卡片 */}
            <Card>
                <CardHeader>
                    <CardTitle>搜索条件</CardTitle>
                    <CardDescription>根据条件筛选游记</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4 items-end flex-wrap">
                        <div className="flex-1 min-w-[200px]">
                            <Label htmlFor="search-title">游记标题</Label>
                            <Input
                                id="search-title"
                                placeholder="请输入游记标题"
                                value={searchParams.title || ''}
                                onChange={(e) => handleSearchInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                        </div>
                        <div className="w-48">
                            <Label htmlFor="search-status">状态</Label>
                            <select
                                id="search-status"
                                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                                value={searchParams.status?.toString() || 'all'}
                                onChange={(e) =>
                                    setSearchParams({
                                        ...searchParams,
                                        status: e.target.value === 'all' ? undefined : parseInt(e.target.value)
                                    })
                                }
                            >
                                <option value="all">全部状态</option>
                                <option value="0">待审核</option>
                                <option value="1">审核通过</option>
                                <option value="2">已驳回</option>
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

            {/* 游记列表 */}
            <Card>
                <CardHeader>
                    <CardTitle>游记列表</CardTitle>
                    <CardDescription>
                        共 {total} 条记录
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>标题</TableHead>
                                <TableHead>作者</TableHead>
                                <TableHead>目的地</TableHead>
                                <TableHead>状态</TableHead>
                                <TableHead>浏览</TableHead>
                                <TableHead>点赞</TableHead>
                                <TableHead>评论</TableHead>
                                <TableHead>发布时间</TableHead>
                                <TableHead className="text-right">操作</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow key="loading">
                                    <TableCell colSpan={10} className="text-center">
                                        加载中...
                                    </TableCell>
                                </TableRow>
                            ) : travelNotes.length === 0 ? (
                                <TableRow key="empty">
                                    <TableCell colSpan={10} className="text-center text-muted-foreground">
                                        暂无数据
                                    </TableCell>
                                </TableRow>
                            ) : (
                                travelNotes.map((note) => (
                                    <TableRow key={note.noteId}>
                                        <TableCell className="font-medium max-w-xs truncate">
                                            {note.title}
                                        </TableCell>
                                        <TableCell>
                                            {note.userNickName || note.userName || note.userId}
                                        </TableCell>
                                        <TableCell>
                                            {note.destinationName || note.destinationId}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={STATUS_MAP[note.status]?.variant}>
                                                {STATUS_MAP[note.status]?.label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{note.viewCount || 0}</TableCell>
                                        <TableCell>{note.likeCount || 0}</TableCell>
                                        <TableCell>{note.commentCount || 0}</TableCell>
                                        <TableCell>
                                            {note.createdAt ? new Date(note.createdAt).toLocaleDateString('zh-CN') : '-'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                {note.status === 0 && (
                                                    <>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleAudit(note, 1)}
                                                            title="审核通过"
                                                        >
                                                            <Check className="h-4 w-4 text-green-600" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleAudit(note, 2)}
                                                            title="审核驳回"
                                                        >
                                                            <X className="h-4 w-4 text-red-600" />
                                                        </Button>
                                                    </>
                                                )}
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>操作</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => handleViewDetail(note)}>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            查看详情
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => handleDelete(note)}
                                                            className="text-destructive"
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            删除
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* 游记详情对话框 */}
            <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle>游记详情</DialogTitle>
                    </DialogHeader>
                    {selectedNote && (
                        <div className="flex-1 overflow-y-auto space-y-4 py-4">
                            <div>
                                <Label>标题</Label>
                                <p className="text-lg font-semibold">{selectedNote.title}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>作者</Label>
                                    <p>{selectedNote.userNickName || selectedNote.userName || selectedNote.userId}</p>
                                </div>
                                <div>
                                    <Label>目的地</Label>
                                    <p>{selectedNote.destinationName || selectedNote.destinationId}</p>
                                </div>
                            </div>
                            <div>
                                <Label>内容</Label>
                                <div className="mt-2 p-4 bg-muted rounded-lg whitespace-pre-wrap">
                                    {selectedNote.content}
                                </div>
                            </div>
                            {selectedNote.images && selectedNote.images.length > 0 && (
                                <div>
                                    <Label>图片</Label>
                                    <div className="mt-2 grid grid-cols-3 gap-4">
                                        {selectedNote.images.map((img, index) => (
                                            <img
                                                key={index}
                                                src={img}
                                                alt={`图片${index + 1}`}
                                                className="w-full h-32 object-cover rounded-lg"
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div className="grid grid-cols-4 gap-4">
                                <div>
                                    <Label>浏览量</Label>
                                    <p>{selectedNote.viewCount || 0}</p>
                                </div>
                                <div>
                                    <Label>点赞数</Label>
                                    <p>{selectedNote.likeCount || 0}</p>
                                </div>
                                <div>
                                    <Label>评论数</Label>
                                    <p>{selectedNote.commentCount || 0}</p>
                                </div>
                                <div>
                                    <Label>发布时间</Label>
                                    <p>{selectedNote.createTime ? new Date(selectedNote.createTime).toLocaleString('zh-CN') : '-'}</p>
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button onClick={() => setDetailDialogOpen(false)}>
                            关闭
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* 驳回原因对话框 */}
            <Dialog open={auditDialogOpen} onOpenChange={setAuditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>驳回游记</DialogTitle>
                        <DialogDescription>
                            请填写驳回原因，该原因将通知给游记作者
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="reject-reason">驳回原因 *</Label>
                            <Textarea
                                id="reject-reason"
                                placeholder="请输入驳回原因"
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                rows={4}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAuditDialogOpen(false)}>
                            取消
                        </Button>
                        <Button onClick={() => selectedNote && performAudit(selectedNote.noteId, 3)}>
                            确认驳回
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
