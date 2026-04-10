'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, Search, Image as ImageIcon, Upload, X, RefreshCw } from "lucide-react"
import BannerApi from "@/api/banner"
import UploadApi from "@/api/upload"
import AttractionApi from "@/api/attraction"
import DestinationApi from "@/api/destination"
import TravelNoteApi from "@/api/travel-note"
import type { BannerVO, QueryBannerDTO, CreateBannerDTO, UpdateBannerDTO } from "@/api/banner"
import type { AttractionVO } from "@/api/attraction"
import type { DestinationVO } from "@/api/destination"
import type { TravelNoteVO } from "@/api/travel-note"

const STATUS_MAP: Record<number, { label: string; variant: "default" | "destructive" }> = {
    0: { label: "禁用", variant: "destructive" },
    1: { label: "启用", variant: "default" },
}

const LINK_TYPE_MAP: Record<number, { label: string }> = {
    0: { label: "外部链接" },
    1: { label: "景点" },
    2: { label: "目的地" },
    3: { label: "游记" },
}

export default function BannersPage() {
    const [banners, setBanners] = useState<BannerVO[]>([])
    const [loading, setLoading] = useState(false)
    const [searchParams, setSearchParams] = useState<QueryBannerDTO>({
        page: 1,
        pageSize: 10,
    })
    const [total, setTotal] = useState(0)

    // 对话框状态
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingBanner, setEditingBanner] = useState<BannerVO | null>(null)
    const [formData, setFormData] = useState<CreateBannerDTO>({
        title: '',
        image: '',
        linkType: 0,
        targetId: '',
        linkUrl: '',
        sort: 0,
        status: 1,
    })
    const [uploading, setUploading] = useState(false)

    // 目标数据列表
    const [attractions, setAttractions] = useState<AttractionVO[]>([])
    const [destinations, setDestinations] = useState<DestinationVO[]>([])
    const [travelNotes, setTravelNotes] = useState<TravelNoteVO[]>([])
    const [loadingTargets, setLoadingTargets] = useState(false)

    // 加载轮播图列表
    const loadBanners = async () => {
        setLoading(true)
        try {
            const response = await BannerApi.list(searchParams)
            console.log('轮播图列表响应:', response)

            const data = response.data?.data
            if (data) {
                if (data.records && Array.isArray(data.records)) {
                    setBanners(data.records)
                    setTotal(data.total || 0)
                } else if (Array.isArray(data)) {
                    setBanners(data)
                    setTotal(data.length)
                } else {
                    setBanners([])
                    setTotal(0)
                }
            } else {
                setBanners([])
                setTotal(0)
            }
        } catch (error) {
            console.error('加载轮播图列表失败:', error)
            setBanners([])
            setTotal(0)
        } finally {
            setLoading(false)
        }
    }

    // 加载目标数据列表
    const loadTargetData = async () => {
        setLoadingTargets(true)
        try {
            // 并行加载所有数据
            const [attractionRes, destinationRes, travelNoteRes] = await Promise.all([
                AttractionApi.list({ pageNum: 1, pageSize: 100, status: 1 }),
                DestinationApi.list({ pageNum: 1, pageSize: 100, status: 1 }),
                TravelNoteApi.list({ pageNum: 1, pageSize: 100, status: 1 })
            ])

            if (attractionRes.data?.data?.records) {
                setAttractions(attractionRes.data.data.records)
            }
            if (destinationRes.data?.data?.records) {
                setDestinations(destinationRes.data.data.records)
            }
            if (travelNoteRes.data?.data?.records) {
                setTravelNotes(travelNoteRes.data.data.records)
            }
        } catch (error) {
            console.error('加载目标数据失败:', error)
        } finally {
            setLoadingTargets(false)
        }
    }

    useEffect(() => {
        loadBanners()
    }, [searchParams])

    // 打开对话框时加载目标数据
    useEffect(() => {
        if (dialogOpen) {
            loadTargetData()
        }
    }, [dialogOpen])

    // 防抖搜索
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

    const handleSearchInput = useCallback((value: string) => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current)
        }
        debounceTimerRef.current = setTimeout(() => {
            setSearchParams(prev => ({ ...prev, title: value, page: 1 }))
        }, 500)
    }, [])

    // 重置搜索
    const handleReset = () => {
        setSearchParams({
            title: '',
            linkType: undefined,
            status: undefined,
            page: 1,
            pageSize: 10,
        })
    }

    // 打开创建对话框
    const handleCreate = () => {
        setEditingBanner(null)
        setFormData({
            title: '',
            image: '',
            linkType: 0,
            targetId: '',
            linkUrl: '',
            sort: 0,
            status: 1,
        })
        setDialogOpen(true)
    }

    // 打开编辑对话框
    const handleEdit = (banner: BannerVO) => {
        setEditingBanner(banner)
        setFormData({
            title: banner.title,
            image: banner.image,
            linkType: banner.linkType,
            targetId: banner.targetId || '',
            linkUrl: banner.linkUrl || '',
            sort: banner.sort,
            status: banner.status,
        })
        setDialogOpen(true)
    }

    // 删除轮播图
    const handleDelete = async (bannerId: number) => {
        if (!confirm('确定要删除这个轮播图吗？')) return

        try {
            await BannerApi.batchDelete({ ids: [bannerId] })
            toast.success('删除成功')
            await loadBanners()
        } catch (error) {
            console.error('删除失败:', error)
        }
    }

    // 保存轮播图
    const handleSave = async () => {
        if (!formData.title.trim()) {
            toast.error('请输入轮播图标题')
            return
        }

        if (!formData.image) {
            toast.error('请上传轮播图图片')
            return
        }

        // 如果选择了外部链接，必须输入链接地址
        if (formData.linkType === 0 && !formData.linkUrl?.trim()) {
            toast.error('请输入外部链接地址')
            return
        }

        // 如果选择了其他类型，必须选择目标
        if (formData.linkType !== 0 && !formData.targetId) {
            toast.error('请选择目标')
            return
        }

        // 检查重复链接
        const isDuplicate = banners.some(banner => {
            // 如果是编辑模式，排除当前编辑的轮播图
            if (editingBanner && banner.id === editingBanner.id) {
                return false
            }

            // 检查链接类型是否相同
            if (banner.linkType !== formData.linkType) {
                return false
            }

            // 根据链接类型检查是否重复
            if (formData.linkType === 0) {
                // 外部链接：检查 linkUrl 是否相同
                return banner.linkUrl === formData.linkUrl
            } else {
                // 其他类型：检查 targetId 是否相同
                return banner.targetId === formData.targetId
            }
        })

        if (isDuplicate) {
            const linkTypeName = LINK_TYPE_MAP[formData.linkType]?.label || '该链接'
            toast.error(`该${linkTypeName}已被其他轮播图使用，请勿重复创建`)
            return
        }

        try {
            if (editingBanner) {
                // 更新
                const updateData: UpdateBannerDTO = {
                    id: editingBanner.id,
                    ...formData,
                }
                await BannerApi.update(updateData)
                toast.success('更新成功')
            } else {
                // 创建
                await BannerApi.create(formData)
                toast.success('创建成功')
            }
            setDialogOpen(false)
            await loadBanners()
        } catch (error) {
            console.error('保存失败:', error)
        }
    }

    // 处理图片上传
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            toast.error('请选择图片文件')
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('图片大小不能超过 5MB')
            return
        }

        setUploading(true)
        try {
            const response = await UploadApi.uploadImage(file)
            setFormData(prev => ({ ...prev, image: response.data.data }))
            toast.success('图片上传成功')
        } catch (error) {
            console.error('上传失败:', error)
            toast.error('上传失败')
        } finally {
            setUploading(false)
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
                    <h1 className="text-3xl font-bold tracking-tight">轮播图管理</h1>
                    <p className="text-muted-foreground">
                        管理首页轮播图
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={loadBanners} variant="outline">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        刷新
                    </Button>
                    <Button onClick={handleCreate}>
                        <Plus className="mr-2 h-4 w-4" />
                        新建轮播图
                    </Button>
                </div>
            </div>

            {/* 搜索卡片 */}
            <Card>
                <CardHeader>
                    <CardTitle>搜索条件</CardTitle>
                    <CardDescription>根据条件筛选轮播图</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4 items-end flex-wrap">
                        <div className="flex-1 min-w-[200px]">
                            <Label htmlFor="search-title">标题</Label>
                            <Input
                                id="search-title"
                                placeholder="请输入轮播图标题"
                                defaultValue={searchParams.title || ''}
                                onChange={(e) => handleSearchInput(e.target.value)}
                            />
                        </div>
                        <div className="w-48">
                            <Label htmlFor="search-linkType">链接类型</Label>
                            <Select
                                value={searchParams.linkType?.toString() || 'all'}
                                onValueChange={(value) =>
                                    setSearchParams({
                                        ...searchParams,
                                        linkType: value === 'all' ? undefined : parseInt(value)
                                    })
                                }
                            >
                                <SelectTrigger id="search-linkType">
                                    <SelectValue placeholder="全部类型" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">全部类型</SelectItem>
                                    <SelectItem value="0">外部链接</SelectItem>
                                    <SelectItem value="1">景点</SelectItem>
                                    <SelectItem value="2">目的地</SelectItem>
                                    <SelectItem value="3">游记</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="w-48">
                            <Label htmlFor="search-status">状态</Label>
                            <Select
                                value={searchParams.status?.toString() || 'all'}
                                onValueChange={(value) =>
                                    setSearchParams({
                                        ...searchParams,
                                        status: value === 'all' ? undefined : parseInt(value)
                                    })
                                }
                            >
                                <SelectTrigger id="search-status">
                                    <SelectValue placeholder="全部状态" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">全部状态</SelectItem>
                                    <SelectItem value="1">启用</SelectItem>
                                    <SelectItem value="0">禁用</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={handleReset}>
                                重置
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 轮播图列表 */}
            <Card>
                <CardHeader>
                    <CardTitle>轮播图列表</CardTitle>
                    <CardDescription>
                        共 {total} 条记录
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>标题</TableHead>
                                <TableHead>图片</TableHead>
                                <TableHead>链接类型</TableHead>
                                <TableHead>链接目标</TableHead>
                                <TableHead>排序</TableHead>
                                <TableHead>状态</TableHead>
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
                            ) : banners.length === 0 ? (
                                <TableRow key="empty">
                                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                                        暂无数据
                                    </TableCell>
                                </TableRow>
                            ) : (
                                banners.map((banner) => (
                                    <TableRow key={banner.id}>
                                        <TableCell className="font-medium">{banner.title}</TableCell>
                                        <TableCell>
                                            <img
                                                src={banner.image}
                                                alt={banner.title}
                                                className="h-16 w-32 object-cover rounded"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {LINK_TYPE_MAP[banner.linkType]?.label || banner.linkType}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-xs max-w-[200px]">
                                            {banner.linkType === 0 ? (
                                                // 外部链接：显示链接地址
                                                <div className="truncate" title={banner.linkUrl}>
                                                    {banner.linkUrl || '-'}
                                                </div>
                                            ) : (
                                                // 其他类型：显示目标ID
                                                <div className="truncate" title={banner.targetId}>
                                                    {banner.targetId || '-'}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>{banner.sort}</TableCell>
                                        <TableCell>
                                            <Badge variant={STATUS_MAP[banner.status]?.variant}>
                                                {STATUS_MAP[banner.status]?.label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEdit(banner)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(banner.id)}
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

            {/* 创建/编辑对话框 */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle>
                            {editingBanner ? '编辑轮播图' : '新建轮播图'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingBanner ? '修改轮播图信息' : '填写轮播图信息'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-2">
                        <div className="space-y-2">
                            <Label htmlFor="title">标题 *</Label>
                            <Input
                                id="title"
                                placeholder="请输入轮播图标题"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="image">图片 *</Label>
                            <div className="space-y-3">
                                {formData.image && (
                                    <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border">
                                        <img
                                            src={formData.image}
                                            alt="轮播图预览"
                                            className="w-full h-full object-cover"
                                        />
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            className="absolute top-2 right-2"
                                            onClick={() => setFormData({ ...formData, image: '' })}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                                <div className="flex gap-2">
                                    <div className="flex-1">
                                        <Input
                                            id="image"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            disabled={uploading}
                                            className="cursor-pointer"
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        disabled={uploading}
                                        onClick={() => document.getElementById('image')?.click()}
                                    >
                                        <Upload className="mr-2 h-4 w-4" />
                                        {uploading ? '上传中...' : '上传图片'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="linkType">链接类型 *</Label>
                                <Select
                                    value={formData.linkType?.toString() || '0'}
                                    onValueChange={(value) => {
                                        setFormData({ ...formData, linkType: parseInt(value), targetId: '', linkUrl: '' })
                                    }}
                                >
                                    <SelectTrigger id="linkType">
                                        <SelectValue placeholder="请选择链接类型" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="0">外部链接</SelectItem>
                                        <SelectItem value="1">景点</SelectItem>
                                        <SelectItem value="2">目的地</SelectItem>
                                        <SelectItem value="3">游记</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {formData.linkType === 0 && (
                                <div className="space-y-2">
                                    <Label htmlFor="linkUrl">外部链接地址 *</Label>
                                    <Input
                                        id="linkUrl"
                                        type="url"
                                        placeholder="请输入外部链接地址，如：https://example.com"
                                        value={formData.linkUrl}
                                        onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                                    />
                                </div>
                            )}
                            {formData.linkType !== 0 && (
                                <div className="space-y-2">
                                    <Label htmlFor="targetId">选择目标 *</Label>
                                    {loadingTargets ? (
                                        <div className="text-sm text-muted-foreground">加载中...</div>
                                    ) : (
                                        <Select
                                            value={formData.targetId}
                                            onValueChange={(value) => setFormData({ ...formData, targetId: value })}
                                        >
                                            <SelectTrigger id="targetId">
                                                <SelectValue placeholder="请选择目标" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {formData.linkType === 1 && attractions.map((attr) => (
                                                    <SelectItem key={attr.aid} value={attr.aid}>
                                                        {attr.name}
                                                    </SelectItem>
                                                ))}
                                                {formData.linkType === 2 && destinations.map((dest) => (
                                                    <SelectItem key={dest.destinationId} value={dest.destinationId}>
                                                        {dest.name}
                                                    </SelectItem>
                                                ))}
                                                {formData.linkType === 3 && travelNotes.map((note) => (
                                                    <SelectItem key={note.noteId} value={note.noteId}>
                                                        {note.title}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="sort">排序</Label>
                                <Input
                                    id="sort"
                                    type="number"
                                    placeholder="请输入排序值"
                                    value={formData.sort}
                                    onChange={(e) => setFormData({ ...formData, sort: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="status">状态</Label>
                                <Select
                                    value={formData.status?.toString() || '1'}
                                    onValueChange={(value) => setFormData({ ...formData, status: parseInt(value) })}
                                >
                                    <SelectTrigger id="status">
                                        <SelectValue placeholder="请选择状态" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">启用</SelectItem>
                                        <SelectItem value="0">禁用</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>
                            取消
                        </Button>
                        <Button onClick={handleSave}>
                            保存
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
