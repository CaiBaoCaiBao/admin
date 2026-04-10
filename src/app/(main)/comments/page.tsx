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
import { Search, Trash2, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react"
import CommentApi from "@/api/comment"
import TravelNoteApi from "@/api/travel-note"
import DestinationApi from "@/api/destination"
import AttractionApi from "@/api/attraction"
import type { QueryCommentDTO, CommentVO } from "@/api/comment"

interface ExtendedCommentVO extends CommentVO {
    targetTitle?: string
}
import type { TravelNoteVO } from "@/api/travel-note"
import type { DestinationVO } from "@/api/destination"
import type { AttractionVO } from "@/api/attraction"

// 评论行组件
function CommentRow({ 
    comment, 
    getTargetTitle, 
    onViewDetail, 
    onDelete 
}: { 
    comment: CommentVO
    getTargetTitle: (targetType: string, targetId: string) => Promise<string>
    onViewDetail: (comment: CommentVO) => void
    onDelete: (comment: CommentVO) => void
}) {
    const [targetTitle, setTargetTitle] = useState<string>('加载中...')

    useEffect(() => {
        getTargetTitle(comment.targetType, comment.targetId).then(setTargetTitle)
    }, [comment.targetType, comment.targetId, getTargetTitle])

    return (
        <TableRow>
            <TableCell>
                <div className="flex items-center gap-2">
                    {comment.avatar && (
                        <img
                            src={comment.avatar}
                            alt=""
                            className="w-8 h-8 rounded-full object-cover"
                        />
                    )}
                    <div className="flex flex-col">
                        <span className="font-medium text-sm">
                            {comment.nickname || comment.username || '未知用户'}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                            @{comment.username || '未知用户名'}
                        </span>
                    </div>
                </div>
            </TableCell>
            <TableCell>
                <Badge variant="outline">
                    {comment.targetType === 'travel_note' ? '游记' :
                     comment.targetType === 'destination' ? '目的地' :
                     comment.targetType === 'attraction' ? '景点' : comment.targetType}
                </Badge>
            </TableCell>
            <TableCell>
                <span className="text-sm font-medium">{targetTitle}</span>
            </TableCell>
            <TableCell className="max-w-xs truncate">
                {comment.content}
            </TableCell>
            <TableCell>
                {comment.createTime ? new Date(comment.createTime).toLocaleString('zh-CN') : '-'}
            </TableCell>
            <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewDetail(comment)}
                        title="查看详情"
                    >
                        <Search className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(comment)}
                        title="删除"
                    >
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                </div>
            </TableCell>
        </TableRow>
    )
}

export default function CommentsPage() {
    const [comments, setComments] = useState<CommentVO[]>([])
    const [loading, setLoading] = useState(false)
    const [searchParams, setSearchParams] = useState<QueryCommentDTO>({
        targetType: 'all',
        targetId: '',
        keyword: '',
        page: 1,
        pageSize: 10,
    })
    const [total, setTotal] = useState(0)
    const [searchInput, setSearchInput] = useState('')

    // 目标内容缓存
    const [targetCache, setTargetCache] = useState<Map<string, { title: string; type: string }>>(new Map())

    // 对话框状态
    const [detailDialogOpen, setDetailDialogOpen] = useState(false)
    const [selectedComment, setSelectedComment] = useState<ExtendedCommentVO | null>(null)

    // 获取目标内容标题
    const getTargetTitle = async (targetType: string, targetId: string): Promise<string> => {
        const cacheKey = `${targetType}_${targetId}`
        
        // 检查缓存
        if (targetCache.has(cacheKey)) {
            return targetCache.get(cacheKey)!.title
        }

        try {
            let title = '未知内容'
            
            if (targetType === 'travel_note') {
                const response = await TravelNoteApi.detail(targetId)
                if (response.data?.data) {
                    const note = response.data.data as TravelNoteVO
                    title = note.title || '未知游记'
                }
            } else if (targetType === 'destination') {
                const response = await DestinationApi.detail(targetId)
                if (response.data?.data) {
                    const dest = response.data.data as DestinationVO
                    title = dest.name || '未知目的地'
                }
            } else if (targetType === 'attraction') {
                const response = await AttractionApi.detail(targetId)
                if (response.data?.data) {
                    const attr = response.data.data as AttractionVO
                    title = attr.name || '未知景点'
                }
            }

            // 更新缓存
            setTargetCache(prev => new Map(prev).set(cacheKey, { title, type: targetType }))
            return title
        } catch (error) {
            console.error('获取目标内容失败:', error)
            return '未知内容'
        }
    }

    // 加载评论列表
    const loadComments = async () => {
        setLoading(true)
        try {
            const response = await CommentApi.list(searchParams)
            console.log('评论列表响应:', response)

            const data = response.data?.data
            if (data) {
                if (data.records && Array.isArray(data.records)) {
                    setComments(data.records)
                    setTotal(data.total || 0)
                } else if (Array.isArray(data)) {
                    setComments(data)
                    setTotal(data.length)
                } else {
                    setComments([])
                    setTotal(0)
                }
            } else {
                setComments([])
                setTotal(0)
            }
        } catch (error) {
            console.error('加载评论列表失败:', error)
            setComments([])
            setTotal(0)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadComments()
    }, [searchParams])

    // 防抖搜索
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

    const handleSearch = useCallback(() => {
        setSearchParams(prev => ({ ...prev, page: 1 }))
    }, [])

    const handleSearchInput = useCallback((value: string) => {
        setSearchInput(value)
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current)
        }
        debounceTimerRef.current = setTimeout(() => {
            setSearchParams(prev => ({ ...prev, keyword: value || '', page: 1 }))
        }, 500)
    }, [])

    // 重置搜索
    const handleReset = () => {
        setSearchInput('')
        setSearchParams({
            targetType: 'all',
            targetId: '',
            keyword: '',
            page: 1,
            pageSize: 10,
        })
    }

    // 分页处理
    const totalPages = Math.ceil(total / searchParams.pageSize!)

    const handlePageChange = (newPage: number) => {
        if (newPage < 1 || newPage > totalPages) return
        setSearchParams(prev => ({ ...prev, page: newPage }))
    }

    // 查看详情
    const handleViewDetail = async (comment: CommentVO) => {
        // 获取目标内容标题
        const title = await getTargetTitle(comment.targetType, comment.targetId)
        setSelectedComment({ ...comment, targetTitle: title })
        setDetailDialogOpen(true)
    }

    // 删除评论
    const handleDelete = async (comment: CommentVO) => {
        if (!confirm('确定要删除这条评论吗？')) return

        try {
            await CommentApi.delete({ commentIds: [comment.commentId] })
            toast.success('删除成功')
            await loadComments()
        } catch (error) {
            console.error('删除评论失败:', error)
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
                    <h1 className="text-3xl font-bold tracking-tight">评论管理</h1>
                    <p className="text-muted-foreground">
                        管理用户评论和反馈
                    </p>
                </div>
                <Button onClick={loadComments} variant="outline">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    刷新
                </Button>
            </div>

            {/* 搜索卡片 */}
            <Card>
                <CardHeader>
                    <CardTitle>搜索条件</CardTitle>
                    <CardDescription>根据条件筛选评论</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4 items-end flex-wrap">
                        <div className="flex-1 min-w-[200px]">
                            <Label htmlFor="search-keyword">关键词</Label>
                            <Input
                                id="search-keyword"
                                placeholder="搜索评论内容、用户昵称、用户名"
                                value={searchInput}
                                onChange={(e) => handleSearchInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                        </div>
                        <div className="w-48">
                            <Label htmlFor="search-type">目标类型</Label>
                            <select
                                id="search-type"
                                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                                value={searchParams.targetType}
                                onChange={(e) =>
                                    setSearchParams({
                                        ...searchParams,
                                        targetType: e.target.value
                                    })
                                }
                            >
                                <option value="all">全部</option>
                                <option value="travel_note">游记</option>
                                <option value="destination">目的地</option>
                                <option value="attraction">景点</option>
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

            {/* 评论列表 */}
            <Card>
                <CardHeader>
                    <CardTitle>评论列表</CardTitle>
                    <CardDescription>
                        共 {total} 条记录
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>评论者</TableHead>
                                <TableHead>目标类型</TableHead>
                                <TableHead>目标内容</TableHead>
                                <TableHead>评论内容</TableHead>
                                <TableHead>发布时间</TableHead>
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
                            ) : comments.length === 0 ? (
                                <TableRow key="empty">
                                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                                        暂无数据
                                    </TableCell>
                                </TableRow>
                            ) : (
                                comments.map((comment) => (
                                    <CommentRow
                                        key={comment.commentId}
                                        comment={comment}
                                        getTargetTitle={getTargetTitle}
                                        onViewDetail={handleViewDetail}
                                        onDelete={handleDelete}
                                    />
                                ))
                            )}
                        </TableBody>
                    </Table>

                    {/* 分页控件 */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-4">
                            <div className="text-sm text-muted-foreground">
                                第 {searchParams.page} 页，共 {totalPages} 页，共 {total} 条记录
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(searchParams.page! - 1)}
                                    disabled={searchParams.page === 1}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    上一页
                                </Button>
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNum
                                        if (totalPages <= 5) {
                                            pageNum = i + 1
                                        } else if (searchParams.page! <= 3) {
                                            pageNum = i + 1
                                        } else if (searchParams.page! >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i
                                        } else {
                                            pageNum = searchParams.page! - 2 + i
                                        }

                                        return (
                                            <Button
                                                key={pageNum}
                                                variant={searchParams.page === pageNum ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => handlePageChange(pageNum)}
                                                className="w-8 h-8"
                                            >
                                                {pageNum}
                                            </Button>
                                        )
                                    })}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(searchParams.page! + 1)}
                                    disabled={searchParams.page === totalPages}
                                >
                                    下一页
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* 评论详情对话框 */}
            <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>评论详情</DialogTitle>
                    </DialogHeader>
                    {selectedComment && (
                        <div className="space-y-4 py-4">
                            <div>
                                <Label>评论者</Label>
                                <div className="flex items-center gap-2 mt-1">
                                    {selectedComment.avatar && (
                                        <img
                                            src={selectedComment.avatar}
                                            alt=""
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                    )}
                                    <div className="flex flex-col">
                                        <span className="font-medium">{selectedComment.nickname || selectedComment.username || '未知用户'}</span>
                                        <span className="text-xs text-muted-foreground">@{selectedComment.username || '未知用户名'}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>目标类型</Label>
                                    <Badge variant="outline" className="mt-1">
                                        {selectedComment.targetType === 'travel_note' ? '游记' :
                                         selectedComment.targetType === 'destination' ? '目的地' :
                                         selectedComment.targetType === 'attraction' ? '景点' : selectedComment.targetType}
                                    </Badge>
                                </div>
                                <div>
                                    <Label>目标内容</Label>
                                    <p className="text-sm font-medium mt-1">{selectedComment.targetTitle || '加载中...'}</p>
                                </div>
                            </div>
                            <div>
                                <Label>评论内容</Label>
                                <div className="mt-2 p-4 bg-muted rounded-lg whitespace-pre-wrap">
                                    {selectedComment.content}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>发布时间</Label>
                                    <p>{selectedComment.createTime ? new Date(selectedComment.createTime).toLocaleString('zh-CN') : '-'}</p>
                                </div>
                                <div>
                                    <Label>更新时间</Label>
                                    <p>{selectedComment.updateTime ? new Date(selectedComment.updateTime).toLocaleString('zh-CN') : '-'}</p>
                                </div>
                            </div>
                            {selectedComment.likeCount !== undefined && (
                                <div>
                                    <Label>点赞数</Label>
                                    <p className="text-2xl font-bold">{selectedComment.likeCount}</p>
                                </div>
                            )}
                        </div>
                    )}
                    <DialogFooter>
                        <Button onClick={() => setDetailDialogOpen(false)}>
                            关闭
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
