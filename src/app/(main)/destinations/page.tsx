'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, Search, Image as ImageIcon, Upload, X } from "lucide-react"
import DestinationApi from "@/api/destination"
import UploadApi from "@/api/upload"
import type { DestinationVO, QueryDestinationDTO, CreateDestinationDTO } from "@/api/destination"
import { PROVINCES, CITIES } from "@/data/china-regions"

const STATUS_MAP: Record<number, { label: string; variant: "default" | "destructive" }> = {
    0: { label: "禁用", variant: "destructive" },
    1: { label: "启用", variant: "default" },
}

const LEVEL_MAP: Record<number, { label: string }> = {
    1: { label: "城市" },
    2: { label: "景区" },
}

// 获取层级标签的辅助函数
const getLevelLabel = (level?: number): string => {
    if (level === undefined) return '-'
    return LEVEL_MAP[level]?.label || '-'
}

export default function DestinationsPage() {
    const [destinations, setDestinations] = useState<DestinationVO[]>([])
    const [loading, setLoading] = useState(false)
    const [searchParams, setSearchParams] = useState<QueryDestinationDTO>({
        pageNum: 1,
        pageSize: 10,
    })
    const [total, setTotal] = useState(0)

    // 对话框状态
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingDestination, setEditingDestination] = useState<DestinationVO | null>(null)
    const [formData, setFormData] = useState<CreateDestinationDTO>({
        name: '',
        aliasesName: '',
        description: '',
        coverImg: '',
        province: '',
        city: '',
        level: undefined,
        bestSeason: '',
        travelDays: undefined,
        status: 1,
        sortOrder: undefined,
    })
    const [uploading, setUploading] = useState(false)

    // 加载目的地列表
    const loadDestinations = async () => {
        setLoading(true)
        try {
            const response = await DestinationApi.list(searchParams)
            console.log('API Response:', response)

            // 处理响应数据
            const data = response.data?.data
            if (data) {
                // 如果返回的是分页格式（PageResult）
                if (data.records && Array.isArray(data.records)) {
                    setDestinations(data.records)
                    setTotal(data.total || 0)
                }
                // 如果直接返回数组
                else if (Array.isArray(data)) {
                    setDestinations(data)
                    setTotal(data.length)
                }
                // 其他情况
                else {
                    setDestinations([])
                    setTotal(0)
                }
            } else {
                setDestinations([])
                setTotal(0)
            }
        } catch (error) {
            console.error('加载目的地列表失败:', error)
            setDestinations([])
            setTotal(0)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadDestinations()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams])

    // 防抖搜索
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

    const handleSearch = useCallback(() => {
        setSearchParams({ ...searchParams, pageNum: 1 })
    }, [searchParams])

    // 防抖处理搜索输入
    const handleSearchInput = useCallback((value: string) => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current)
        }
        debounceTimerRef.current = setTimeout(() => {
            setSearchParams(prev => ({ ...prev, name: value, pageNum: 1 }))
        }, 500)
    }, [])

    // 重置搜索
    const handleReset = () => {
        setSearchParams({
            name: '',
            status: undefined,
            pageNum: 1,
            pageSize: 10,
        })
        loadDestinations()
    }

    // 打开创建对话框
    const handleCreate = () => {
        setEditingDestination(null)
        setFormData({
            name: '',
            aliasesName: '',
            description: '',
            coverImg: '',
            province: '',
            city: '',
            level: undefined,
            bestSeason: '',
            travelDays: undefined,
            status: 1,
            sortOrder: undefined,
        })
        setDialogOpen(true)
    }

    // 打开编辑对话框
    const handleEdit = (destination: DestinationVO) => {
        setEditingDestination(destination)
        setFormData({
            name: destination.name,
            aliasesName: destination.aliasesName || '',
            description: destination.description || '',
            coverImg: destination.coverImg,
            province: destination.province || '',
            city: destination.city || '',
            level: destination.level,
            bestSeason: destination.bestSeason || '',
            travelDays: destination.travelDays,
            status: destination.status ?? 1,
            sortOrder: destination.sortOrder,
        })
        setDialogOpen(true)
    }

    // 删除目的地
    const handleDelete = async (destinationId: string) => {
        if (!confirm('确定要删除这个目的地吗？')) return

        try {
            await DestinationApi.batchDelete({ destinationIds: [destinationId] })
            toast.success('删除成功')
            await loadDestinations()
        } catch (error) {
            console.error('删除失败:', error)
        }
    }

    // 保存目的地
    const handleSave = async () => {
        if (!formData.name.trim()) {
            toast.error('请输入目的地名称')
            return
        }

        try {
            if (editingDestination) {
                // 更新
                await DestinationApi.update({
                    destinationId: editingDestination.destinationId,
                    ...formData,
                })
                toast.success('更新成功')
            } else {
                // 创建
                await DestinationApi.create(formData)
                toast.success('创建成功')
            }
            setDialogOpen(false)
            await loadDestinations()
        } catch (error) {
            console.error('保存失败:', error)
        }
    }

    // 处理图片上传
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // 验证文件类型
        if (!file.type.startsWith('image/')) {
            toast.error('请选择图片文件')
            return
        }

        // 验证文件大小（5MB）
        if (file.size > 5 * 1024 * 1024) {
            toast.error('图片大小不能超过 5MB')
            return
        }

        setUploading(true)
        try {
            const response = await UploadApi.uploadImage(file)
            console.log('封面图片上传响应:', response)
            setFormData(prev => ({ ...prev, coverImg: response.data.data }))
            toast.success('封面图片上传成功')
        } catch (error) {
            console.error('上传失败:', error)
            toast.error('上传失败')
        } finally {
            setUploading(false)
        }
    }

    // 清除封面图
    const handleClearCoverImg = () => {
        setFormData({ ...formData, coverImg: '' })
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
                    <h1 className="text-3xl font-bold tracking-tight">目的地管理</h1>
                    <p className="text-muted-foreground">
                        管理旅游目的地信息
                    </p>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    新建目的地
                </Button>
            </div>

            {/* 搜索卡片 */}
            <Card>
                <CardHeader>
                    <CardTitle>搜索条件</CardTitle>
                    <CardDescription>根据条件筛选目的地</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4 items-end">
                        <div className="flex-1">
                            <Label htmlFor="search-name">目的地名称</Label>
                            <Input
                                id="search-name"
                                placeholder="请输入目的地名称"
                                value={searchParams.name || ''}
                                onChange={(e) => handleSearchInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
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

            {/* 目的地列表 */}
            <Card>
                <CardHeader>
                    <CardTitle>目的地列表</CardTitle>
                    <CardDescription>
                        共 {total} 条记录
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>名称</TableHead>
                                <TableHead>别名</TableHead>
                                <TableHead>省份</TableHead>
                                <TableHead>城市</TableHead>
                                <TableHead>层级</TableHead>
                                <TableHead>封面图</TableHead>
                                <TableHead>状态</TableHead>
                                <TableHead>浏览量</TableHead>
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
                            ) : destinations.length === 0 ? (
                                <TableRow key="empty">
                                    <TableCell colSpan={9} className="text-center text-muted-foreground">
                                        暂无数据
                                    </TableCell>
                                </TableRow>
                            ) : (
                                destinations.map((destination) => (
                                    <TableRow key={destination.destinationId}>
                                        <TableCell className="font-medium">{destination.name}</TableCell>
                                        <TableCell>{destination.aliasesName || '-'}</TableCell>
                                        <TableCell>{destination.province || '-'}</TableCell>
                                        <TableCell>{destination.city || '-'}</TableCell>
                                        <TableCell>
                                            {getLevelLabel(destination.level)}
                                        </TableCell>
                                        <TableCell>
                                            {destination.coverImg ? (
                                                <div className="flex items-center gap-2">
                                                    <img
                                                        src={destination.coverImg}
                                                        alt={destination.name}
                                                        className="h-10 w-10 rounded object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">未设置</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={STATUS_MAP[destination.status ?? 1]?.variant}>
                                                {STATUS_MAP[destination.status ?? 1]?.label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{destination.viewCount || 0}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEdit(destination)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(destination.destinationId)}
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
                            {editingDestination ? '编辑目的地' : '新建目的地'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingDestination ? '修改目的地信息' : '填写目的地信息'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-2">
                        <div className="space-y-2">
                            <Label htmlFor="name">目的地名称 *</Label>
                            <Input
                                id="name"
                                placeholder="请输入目的地名称"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="aliasesName">别名</Label>
                            <Input
                                id="aliasesName"
                                placeholder="请输入目的地别名（可选）"
                                value={formData.aliasesName || ''}
                                onChange={(e) => setFormData({ ...formData, aliasesName: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">描述</Label>
                            <Textarea
                                id="description"
                                placeholder="请输入目的地描述"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="coverImg">封面图</Label>
                            <div className="space-y-3">
                                {/* 图片预览 */}
                                {formData.coverImg && (
                                    <div className="relative w-full h-32 rounded-lg overflow-hidden border border-border">
                                        <img
                                            src={formData.coverImg}
                                            alt="封面图预览"
                                            className="w-full h-full object-cover"
                                        />
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            className="absolute top-2 right-2"
                                            onClick={handleClearCoverImg}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}

                                {/* 上传按钮 */}
                                <div className="flex gap-2">
                                    <div className="flex-1">
                                        <Input
                                            id="coverImg"
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
                                        onClick={() => document.getElementById('coverImg')?.click()}
                                    >
                                        <Upload className="mr-2 h-4 w-4" />
                                        {uploading ? '上传中...' : '上传图片'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="province">省份</Label>
                                <Select
                                    value={formData.province}
                                    onValueChange={(value) => {
                                        const selectedProvince = PROVINCES.find(p => p.name === value)
                                        setFormData({ ...formData, province: value, city: '' })
                                    }}
                                >
                                    <SelectTrigger id="province">
                                        <SelectValue placeholder="请选择省份" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PROVINCES.map((province) => (
                                            <SelectItem key={province.code} value={province.name}>
                                                {province.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="city">城市</Label>
                                <Select
                                    value={formData.city}
                                    onValueChange={(value) => setFormData({ ...formData, city: value })}
                                    disabled={!formData.province}
                                >
                                    <SelectTrigger id="city">
                                        <SelectValue placeholder={formData.province ? "请选择城市" : "请先选择省份"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {formData.province && (() => {
                                            const selectedProvince = PROVINCES.find(p => p.name === formData.province)
                                            const cities = selectedProvince ? CITIES[selectedProvince.code] : []
                                            return cities.map((city) => (
                                                <SelectItem key={city.code} value={city.name}>
                                                    {city.name}
                                                </SelectItem>
                                            ))
                                        })()}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="level">层级</Label>
                                <Select
                                    value={formData.level?.toString() || ''}
                                    onValueChange={(value) => setFormData({ ...formData, level: parseInt(value) })}
                                >
                                    <SelectTrigger id="level">
                                        <SelectValue placeholder="请选择层级" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">城市</SelectItem>
                                        <SelectItem value="2">景区</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="travelDays">建议游玩天数</Label>
                                <Input
                                    id="travelDays"
                                    type="number"
                                    placeholder="请输入天数"
                                    value={formData.travelDays || ''}
                                    onChange={(e) => setFormData({ ...formData, travelDays: e.target.value ? parseInt(e.target.value) : undefined })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="bestSeason">最佳季节</Label>
                                <Input
                                    id="bestSeason"
                                    placeholder="如：春季、秋季"
                                    value={formData.bestSeason}
                                    onChange={(e) => setFormData({ ...formData, bestSeason: e.target.value })}
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
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="sortOrder">排序</Label>
                                <Input
                                    id="sortOrder"
                                    type="number"
                                    placeholder="请输入排序值"
                                    value={formData.sortOrder || ''}
                                    onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value ? parseInt(e.target.value) : undefined })}
                                />
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
