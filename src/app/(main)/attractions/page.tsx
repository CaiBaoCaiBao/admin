'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, Search, Image as ImageIcon, Upload, X, RefreshCw, Ticket as TicketIcon, Star } from "lucide-react"
import AttractionApi from "@/api/attraction"
import DestinationApi from "@/api/destination"
import UploadApi from "@/api/upload"
import TicketApi, { type TicketVO, type CreateTicketDTO, type UpdateTicketDTO } from "@/api/ticket"
import PlayItemApi, { type PlayItemVO, type CreatePlayItemDTO, type UpdatePlayItemDTO } from "@/api/play-item"
import type { AttractionVO, QueryAttractionDTO, CreateAttractionDTO, UpdateAttractionDTO } from "@/api/attraction"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// 封面图从 images 数组的第一张获取
const getCoverImage = (images: string[] | undefined | null): string => {
    if (!images || !Array.isArray(images) || images.length === 0) return ''
    return images[0] || ''
}

// 设置封面图（更新 images 数组的第一张）
const setCoverImage = (images: string[] | undefined, newCover: string): string[] => {
    if (!images || images.length === 0) {
        return newCover ? [newCover] : []
    }
    if (newCover) {
        const newImages = [...images]
        newImages[0] = newCover
        return newImages
    }
    return images
}

// 安全地转换经纬度为数字，避免科学计数法（暂时注释）
// const parseCoordinate = (value: string | number | undefined): number | undefined => {
//     if (value === undefined || value === null || value === '') return undefined
//     const num = typeof value === 'string' ? parseFloat(value) : value
//     if (isNaN(num)) return undefined
//     // 限制经纬度范围
//     if (Math.abs(num) > 180) return undefined
//     return num
// }
import type { DestinationVO } from "@/api/destination"

const STATUS_MAP: Record<number, { label: string; variant: "default" | "destructive" }> = {
    0: { label: "禁用", variant: "destructive" },
    1: { label: "启用", variant: "default" },
}

export default function AttractionsPage() {
    const [attractions, setAttractions] = useState<AttractionVO[]>([])
    const [destinations, setDestinations] = useState<DestinationVO[]>([])
    const [loading, setLoading] = useState(false)
    const [searchParams, setSearchParams] = useState<QueryAttractionDTO>({
        pageNum: 1,
        pageSize: 10,
    })
    const [total, setTotal] = useState(0)

    // 对话框状态
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingAttraction, setEditingAttraction] = useState<AttractionVO | null>(null)
    const [formData, setFormData] = useState<CreateAttractionDTO>({
        destinationId: '',
        name: '',
        description: '',
        images: [],
        address: '',
        phone: '',
        // longitude: undefined,
        // latitude: undefined,
        sortOrder: undefined,
        realTimeSyncFlag: false,
        status: 1,
    })
    const [uploading, setUploading] = useState(false)
    const [activeTab, setActiveTab] = useState<'basic' | 'tickets' | 'playitems'>('basic')

    // 门票管理状态
    const [tickets, setTickets] = useState<TicketVO[]>([])
    const [ticketDialogOpen, setTicketDialogOpen] = useState(false)
    const [editingTicket, setEditingTicket] = useState<TicketVO | null>(null)
    const [ticketFormData, setTicketFormData] = useState<CreateTicketDTO>({
        attractionId: '',
        ticketName: '',
        ticketType: '成人票',
        price: 0,
        discountPrice: 0,
        stock: 100,
        validDays: 1,
        status: 1,
    })

    // 游玩项目管理状态
    const [playItems, setPlayItems] = useState<PlayItemVO[]>([])
    const [playItemDialogOpen, setPlayItemDialogOpen] = useState(false)
    const [editingPlayItem, setEditingPlayItem] = useState<PlayItemVO | null>(null)
    const [playItemFormData, setPlayItemFormData] = useState<CreatePlayItemDTO>({
        aid: '',
        name: '',
        images: [],
        duration: 60,
        maxPerson: 10,
        minPerson: 1,
        price: 0,
        discountPrice: 0,
        status: 1,
    })

    // 加载景点列表
    const loadAttractions = async () => {
        setLoading(true)
        try {
            const response = await AttractionApi.list(searchParams)
            console.log('景点列表响应:', response)

            const data = response.data?.data
            if (data) {
                if (data.records && Array.isArray(data.records)) {
                    setAttractions(data.records)
                    setTotal(data.total || 0)
                } else if (Array.isArray(data)) {
                    setAttractions(data)
                    setTotal(data.length)
                } else {
                    setAttractions([])
                    setTotal(0)
                }
            } else {
                setAttractions([])
                setTotal(0)
            }
        } catch (error) {
            console.error('加载景点列表失败:', error)
            setAttractions([])
            setTotal(0)
        } finally {
            setLoading(false)
        }
    }

    // 加载目的地列表
    const loadDestinations = async () => {
        try {
            const response = await DestinationApi.list({ pageNum: 1, pageSize: 1000 })
            const data = response.data?.data
            if (data?.records) {
                setDestinations(data.records)
            } else if (Array.isArray(data)) {
                setDestinations(data)
            }
        } catch (error) {
            console.error('加载目的地列表失败:', error)
        }
    }

    useEffect(() => {
        loadAttractions()
        loadDestinations()
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
            setSearchParams(prev => ({ ...prev, name: value, pageNum: 1 }))
        }, 500)
    }, [])

    // 重置搜索
    const handleReset = () => {
        setSearchParams({
            name: '',
            status: undefined,
            destinationId: undefined,
            pageNum: 1,
            pageSize: 10,
        })
        loadAttractions()
    }

    // 打开创建对话框
    const handleCreate = () => {
        setEditingAttraction(null)
        setFormData({
            destinationId: '',
            name: '',
            description: '',
            images: [],
            address: '',
            phone: '',
            // longitude: undefined,
            // latitude: undefined,
            sortOrder: undefined,
            realTimeSyncFlag: false,
            status: 1,
        })
        setDialogOpen(true)
    }

    // 打开编辑对话框
    const handleEdit = async (attraction: AttractionVO) => {
        setEditingAttraction(attraction)
        setFormData({
            destinationId: attraction.destinationId,
            name: attraction.name,
            description: attraction.description || '',
            images: attraction.images || [],
            address: attraction.address || '',
            phone: attraction.phone || '',
            // longitude: attraction.longitude || undefined,
            // latitude: attraction.latitude || undefined,
            sortOrder: attraction.sortOrder || undefined,
            realTimeSyncFlag: attraction.realTimeSyncFlag,
            status: attraction.status || 1,
        })
        setDialogOpen(true)
        setActiveTab('basic')

        // 加载门票和游玩项目
        await loadTickets(attraction.aid)
        await loadPlayItems(attraction.aid)
    }

    // 加载门票列表
    const loadTickets = async (attractionId: string) => {
        try {
            const response = await TicketApi.list({ attractionId, pageNum: 1, pageSize: 100 })
            const data = response.data?.data
            if (data?.records) {
                setTickets(data.records)
            } else if (Array.isArray(data)) {
                setTickets(data)
            } else {
                setTickets([])
            }
        } catch (error) {
            console.error('加载门票列表失败:', error)
            setTickets([])
        }
    }

    // 加载游玩项目列表
    const loadPlayItems = async (attractionId: string) => {
        try {
            const response = await PlayItemApi.list({ attractionId: attractionId, pageNum: 1, pageSize: 100 })
            const data = response.data?.data
            if (data?.records) {
                setPlayItems(data.records)
            } else if (Array.isArray(data)) {
                setPlayItems(data)
            } else {
                setPlayItems([])
            }
        } catch (error) {
            console.error('加载游玩项目列表失败:', error)
            setPlayItems([])
        }
    }

    // 门票管理函数
    const handleCreateTicket = () => {
        setEditingTicket(null)
        setTicketFormData({
            attractionId: editingAttraction?.aid || '',
            ticketName: '',
            ticketType: '成人票',
            price: 0,
            discountPrice: 0,
            stock: 100,
            validDays: 1,
            status: 1,
        })
        setTicketDialogOpen(true)
    }

    const handleEditTicket = (ticket: TicketVO) => {
        setEditingTicket(ticket)
        setTicketFormData({
            attractionId: ticket.attractionId,
            ticketName: ticket.ticketName,
            ticketCode: ticket.ticketCode || undefined,
            ticketType: ticket.ticketType || undefined,
            price: ticket.price || undefined,
            discountPrice: ticket.discountPrice || undefined,
            stock: ticket.stock || undefined,
            validDays: ticket.validDays || undefined,
            description: ticket.description || undefined,
            sortOrder: ticket.sortOrder || undefined,
            status: ticket.status !== undefined && ticket.status !== null ? ticket.status : 1,
        })
        setTicketDialogOpen(true)
    }

    const handleSaveTicket = async () => {
        if (!ticketFormData.ticketName.trim()) {
            toast.error('请输入门票名称')
            return
        }

        try {
            if (editingTicket) {
                const updateData: UpdateTicketDTO = {
                    tid: editingTicket.tid,
                    ...ticketFormData,
                }
                await TicketApi.update(updateData)
                toast.success('更新门票成功')
            } else {
                await TicketApi.create(ticketFormData)
                toast.success('创建门票成功')
            }
            setTicketDialogOpen(false)
            if (editingAttraction) {
                await loadTickets(editingAttraction.aid)
            }
        } catch (error) {
            console.error('保存门票失败:', error)
            toast.error('保存门票失败')
        }
    }

    const handleDeleteTicket = async (tid: string) => {
        if (!confirm('确定要删除这个门票吗？')) return

        try {
            await TicketApi.batchDelete({ tids: [tid] })
            toast.success('删除门票成功')
            if (editingAttraction) {
                await loadTickets(editingAttraction.aid)
            }
        } catch (error) {
            console.error('删除门票失败:', error)
            toast.error('删除门票失败')
        }
    }

    // 游玩项目管理函数
    const handleCreatePlayItem = () => {
        setEditingPlayItem(null)
        setPlayItemFormData({
            attractionId: editingAttraction?.aid || '',
            name: '',
            images: [],
            duration: 60,
            maxPerson: 10,
            minPerson: 1,
            price: 0,
            discountPrice: undefined,
            status: 1,
        })
        setPlayItemDialogOpen(true)
    }

    const handleEditPlayItem = (playItem: PlayItemVO) => {
        setEditingPlayItem(playItem)
        setPlayItemFormData({
            attractionId: playItem.aid,
            name: playItem.name,
            images: playItem.images || undefined,
            description: playItem.description || undefined,
            duration: playItem.duration || undefined,
            maxPerson: playItem.maxPerson || undefined,
            minPerson: playItem.minPerson || undefined,
            minAge: playItem.minAge || undefined,
            maxAge: playItem.maxAge || undefined,
            price: playItem.price || undefined,
            discountPrice: playItem.discountPrice && playItem.discountPrice > 0 ? playItem.discountPrice : undefined,
            status: playItem.status !== undefined && playItem.status !== null ? playItem.status : 1,
        })
        setPlayItemDialogOpen(true)
    }

    const handleSavePlayItem = async () => {
        if (!playItemFormData.name.trim()) {
            toast.error('请输入游玩项目名称')
            return
        }

        try {
            if (editingPlayItem) {
                const updateData: UpdatePlayItemDTO = {
                    piid: editingPlayItem.piid,
                    ...playItemFormData,
                }
                await PlayItemApi.update(updateData)
                toast.success('更新游玩项目成功')
            } else {
                await PlayItemApi.create(playItemFormData)
                toast.success('创建游玩项目成功')
            }
            setPlayItemDialogOpen(false)
            if (editingAttraction) {
                await loadPlayItems(editingAttraction.aid)
            }
        } catch (error) {
            console.error('保存游玩项目失败:', error)
            toast.error('保存游玩项目失败')
        }
    }

    const handleDeletePlayItem = async (piid: string) => {
        if (!confirm('确定要删除这个游玩项目吗？')) return

        try {
            await PlayItemApi.batchDelete({ piids: [piid] })
            toast.success('删除游玩项目成功')
            if (editingAttraction) {
                await loadPlayItems(editingAttraction.aid)
            }
        } catch (error) {
            console.error('删除游玩项目失败:', error)
            toast.error('删除游玩项目失败')
        }
    }

    // 删除景点
    const handleDelete = async (aid: string) => {
        if (!confirm('确定要删除这个景点吗？')) return

        try {
            await AttractionApi.batchDelete({ aids: [aid] })
            toast.success('删除成功')
            await loadAttractions()
        } catch (error) {
            console.error('删除失败:', error)
        }
    }

    // 保存景点
    const handleSave = async () => {
        if (!formData.name.trim()) {
            toast.error('请输入景点名称')
            return
        }

        if (!formData.destinationId) {
            toast.error('请选择所属目的地')
            return
        }

        try {
            if (editingAttraction) {
                // 更新
                const updateData: UpdateAttractionDTO = {
                    aid: editingAttraction.aid,
                    ...formData,
                }
                await AttractionApi.update(updateData)
                toast.success('更新成功')
            } else {
                // 创建
                await AttractionApi.create(formData)
                toast.success('创建成功')
            }
            setDialogOpen(false)
            await loadAttractions()
        } catch (error) {
            console.error('保存失败:', error)
        }
    }

    // 处理封面图上传
    const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
            const newCover = response.data.data
            setFormData(prev => ({
                ...prev,
                images: setCoverImage(prev.images, newCover)
            }))
            toast.success('封面图片上传成功')
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
                    <h1 className="text-3xl font-bold tracking-tight">景点管理</h1>
                    <p className="text-muted-foreground">
                        管理景点详细信息
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={loadAttractions} variant="outline">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        刷新
                    </Button>
                    <Button onClick={handleCreate}>
                        <Plus className="mr-2 h-4 w-4" />
                        新建景点
                    </Button>
                </div>
            </div>

            {/* 搜索卡片 */}
            <Card>
                <CardHeader>
                    <CardTitle>搜索条件</CardTitle>
                    <CardDescription>根据条件筛选景点</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4 items-end flex-wrap">
                        <div className="flex-1 min-w-[200px]">
                            <Label htmlFor="search-name">景点名称</Label>
                            <Input
                                id="search-name"
                                placeholder="请输入景点名称"
                                value={searchParams.name || ''}
                                onChange={(e) => handleSearchInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                        </div>
                        <div className="w-48">
                            <Label htmlFor="search-destination">所属目的地</Label>
                            <Select
                                value={searchParams.destinationId || 'all'}
                                onValueChange={(value) =>
                                    setSearchParams({
                                        ...searchParams,
                                        destinationId: value === 'all' ? undefined : value
                                    })
                                }
                            >
                                <SelectTrigger id="search-destination">
                                    <SelectValue placeholder="全部目的地" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem key="all-destinations" value="all">全部目的地</SelectItem>
                                    {destinations.map((dest) => (
                                        <SelectItem key={dest.destinationId} value={dest.destinationId}>
                                            {dest.name}
                                        </SelectItem>
                                    ))}
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
                                    <SelectItem key="all" value="all">全部状态</SelectItem>
                                    <SelectItem key="1" value="1">启用</SelectItem>
                                    <SelectItem key="0" value="0">禁用</SelectItem>
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

            {/* 景点列表 */}
            <Card>
                <CardHeader>
                    <CardTitle>景点列表</CardTitle>
                    <CardDescription>
                        共 {total} 条记录
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>名称</TableHead>
                                <TableHead>所属目的地</TableHead>
                                <TableHead>位置</TableHead>
                                <TableHead>封面图</TableHead>
                                <TableHead>状态</TableHead>
                                <TableHead className="text-right">操作</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow key="loading">
                                    <TableCell colSpan={6} className="text-center">
                                        加载中...
                                    </TableCell>
                                </TableRow>
                            ) : attractions.length === 0 ? (
                                <TableRow key="empty">
                                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                                        暂无数据
                                    </TableCell>
                                </TableRow>
                            ) : (
                                <>
                                    {attractions.map((attraction, attractionIndex) => (
                                        <TableRow key={attraction.aid || attractionIndex}>
                                            <TableCell className="font-medium">{attraction.name}</TableCell>
                                            <TableCell>
                                                {destinations.find(d => d.destinationId === attraction.destinationId)?.name || attraction.destinationId}
                                            </TableCell>
                                            <TableCell>{attraction.address || '-'}</TableCell>
                                            <TableCell>
                                                {getCoverImage(attraction.images) ? (
                                                    <img
                                                        src={getCoverImage(attraction.images)}
                                                        alt={attraction.name}
                                                        className="h-10 w-10 rounded object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">未设置</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={STATUS_MAP[attraction.status]?.variant}>
                                                    {STATUS_MAP[attraction.status]?.label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEdit(attraction)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(attraction.aid)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* 创建/编辑抽屉 */}
            <Drawer open={dialogOpen} onOpenChange={setDialogOpen} direction="right">
                <DrawerContent className="max-w-4xl h-[100vh] overflow-hidden flex flex-col">
                    <DrawerHeader>
                        <DrawerTitle>
                            {editingAttraction ? '编辑景点' : '新建景点'}
                        </DrawerTitle>
                        <DrawerDescription>
                            {editingAttraction ? '修改景点信息' : '填写景点信息'}
                        </DrawerDescription>
                    </DrawerHeader>
                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col min-h-0">
                        <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
                            <TabsTrigger value="basic">基本信息</TabsTrigger>
                            <TabsTrigger value="tickets" disabled={!editingAttraction}>门票管理</TabsTrigger>
                            <TabsTrigger value="playitems" disabled={!editingAttraction}>游玩项目</TabsTrigger>
                        </TabsList>

                        <TabsContent value="basic" className="flex-1 overflow-y-auto mt-4 min-h-0">
                            <div className="space-y-4 pr-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">景点名称 *</Label>
                                    <Input
                                        id="name"
                                        placeholder="请输入景点名称"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="destinationId">所属目的地 *</Label>
                                    <Select
                                        value={formData.destinationId}
                                        onValueChange={(value) => setFormData({ ...formData, destinationId: value })}
                                    >
                                        <SelectTrigger id="destinationId">
                                            <SelectValue placeholder="请选择所属目的地" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {destinations.map((dest) => (
                                                <SelectItem key={dest.destinationId} value={dest.destinationId}>
                                                    {dest.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">描述</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="请输入景点描述"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={3}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="address">地址</Label>
                                    <Input
                                        id="address"
                                        placeholder="请输入景点地址"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">联系电话</Label>
                                    <Input
                                        id="phone"
                                        placeholder="请输入联系电话"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
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
                                <div className="space-y-2">
                                    <Label htmlFor="realTimeSyncFlag">实时同步</Label>
                                    <Select
                                        value={formData.realTimeSyncFlag?.toString() || 'false'}
                                        onValueChange={(value) => setFormData({ ...formData, realTimeSyncFlag: value === 'true' })}
                                    >
                                        <SelectTrigger id="realTimeSyncFlag">
                                            <SelectValue placeholder="请选择是否实时同步" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem key="true" value="true">是</SelectItem>
                                            <SelectItem key="false" value="false">否</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="coverImage">封面图</Label>
                                    <div className="space-y-3">
                                        {getCoverImage(formData.images) && (
                                            <div className="relative w-full h-32 rounded-lg overflow-hidden border border-border">
                                                <img
                                                    src={getCoverImage(formData.images)}
                                                    alt="封面图预览"
                                                    className="w-full h-full object-cover"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="icon"
                                                    className="absolute top-2 right-2"
                                                    onClick={() => setFormData({ ...formData, images: [] })}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        )}
                                        <div className="flex gap-2">
                                            <div className="flex-1">
                                                <Input
                                                    id="coverImage"
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleCoverImageUpload}
                                                    disabled={uploading}
                                                    className="cursor-pointer"
                                                />
                                            </div>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                disabled={uploading}
                                                onClick={() => document.getElementById('coverImage')?.click()}
                                            >
                                                <Upload className="mr-2 h-4 w-4" />
                                                {uploading ? '上传中...' : '上传图片'}
                                            </Button>
                                        </div>
                                    </div>
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
                                            <SelectItem key="1" value="1">启用</SelectItem>
                                            <SelectItem key="0" value="0">禁用</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="tickets" className="flex-1 overflow-y-auto mt-4 min-h-0">
                            <div className="space-y-4 pr-2">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-semibold">门票列表 ({tickets.length})</h3>
                                    <Button onClick={handleCreateTicket} size="sm">
                                        <Plus className="mr-2 h-4 w-4" />
                                        添加门票
                                    </Button>
                                </div>
                                {tickets.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <TicketIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                        <p>暂无门票信息</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {tickets.map((ticket) => (
                                            <Card key={ticket.tid}>
                                                <CardContent className="p-4">
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <h4 className="font-semibold">{ticket.ticketName}</h4>
                                                                {ticket.ticketType && (
                                                                    <Badge variant="secondary">{ticket.ticketType}</Badge>
                                                                )}
                                                                <Badge variant={ticket.status === 1 ? "default" : "secondary"}>
                                                                    {ticket.status === 1 ? '启用' : '禁用'}
                                                                </Badge>
                                                            </div>
                                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                                <span>价格: ¥{Number(ticket.price || 0).toFixed(2)}</span>
                                                                {!(ticket.discountPrice==0) && Number(ticket.discountPrice) < Number(ticket.price || 0) && (
                                                                    <span className="text-red-600">优惠价: ¥{Number(ticket.discountPrice).toFixed(2)}</span>
                                                                )}
                                                                <span>库存: {ticket.stock === -1 ? '不限' : ticket.stock}</span>
                                                                <span>有效期: {ticket.validDays}天</span>
                                                            </div>
                                                            {ticket.description && (
                                                                <p className="text-sm text-muted-foreground mt-2">{ticket.description}</p>
                                                            )}
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleEditTicket(ticket)}
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDeleteTicket(ticket.tid)}
                                                            >
                                                                <Trash2 className="h-4 w-4 text-destructive" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="playitems" className="flex-1 overflow-y-auto mt-4 min-h-0">
                            <div className="space-y-4 pr-2">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-semibold">游玩项目列表 ({playItems.length})</h3>
                                    <Button onClick={handleCreatePlayItem} size="sm">
                                        <Plus className="mr-2 h-4 w-4" />
                                        添加游玩项目
                                    </Button>
                                </div>
                                {playItems.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Star className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                        <p>暂无游玩项目</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {playItems.map((item) => (
                                            <Card key={item.id}>
                                                <CardContent className="p-4">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h4 className="font-semibold">{item.name}</h4>
                                                        <Badge variant={item.status === 1 ? "default" : "secondary"}>
                                                            {item.status === 1 ? '启用' : '禁用'}
                                                        </Badge>
                                                    </div>
                                                    {item.images && item.images.length > 0 && (
                                                        <img
                                                            src={item.images[0]}
                                                            alt={item.name}
                                                            className="w-full h-32 object-cover rounded mb-2"
                                                        />
                                                    )}
                                                    <div className="space-y-1 text-sm text-muted-foreground">
                                                        {item.duration && <p>时长: {item.duration}分钟</p>}
                                                        {item.minPerson && item.maxPerson && <p>人数: {item.minPerson}-{item.maxPerson}人</p>}
                                                        {item.price !== undefined && item.price !== null && (
                                                            <p>
                                                                {item.discountPrice && Number(item.discountPrice) > 0 && Number(item.discountPrice) < Number(item.price) ? (
                                                                    <>
                                                                        <span className="line-through text-muted-foreground">¥{Number(item.price).toFixed(2)}</span>
                                                                        <span className="text-red-600 ml-2">优惠价: ¥{Number(item.discountPrice).toFixed(2)}</span>
                                                                    </>
                                                                ) : (
                                                                    <>价格: ¥{Number(item.price).toFixed(2)}</>
                                                                )}
                                                            </p>
                                                        )}
                                                    </div>
                                                    {item.description && (
                                                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{item.description}</p>
                                                    )}
                                                    <div className="flex gap-2 mt-3">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="flex-1"
                                                            onClick={() => handleEditPlayItem(item)}
                                                        >
                                                            <Pencil className="h-4 w-4 mr-1" />
                                                            编辑
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleDeletePlayItem(item.piid)}
                                                        >
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                    <DrawerFooter>
                        <div className="flex gap-2">
                            <DrawerClose asChild>
                                <Button variant="outline">
                                    取消
                                </Button>
                            </DrawerClose>
                            <Button onClick={handleSave}>
                                保存
                            </Button>
                        </div>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>

            {/* 门票编辑对话框 */}
            <Dialog open={ticketDialogOpen} onOpenChange={setTicketDialogOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            {editingTicket ? '编辑门票' : '添加门票'}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="ticketName">门票名称 *</Label>
                            <Input
                                id="ticketName"
                                placeholder="请输入门票名称"
                                value={ticketFormData.ticketName}
                                onChange={(e) => setTicketFormData({ ...ticketFormData, ticketName: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="ticketType">门票类型</Label>
                            <Select
                                value={ticketFormData.ticketType || '成人票'}
                                onValueChange={(value) => setTicketFormData({ ...ticketFormData, ticketType: value })}
                            >
                                <SelectTrigger id="ticketType">
                                    <SelectValue placeholder="请选择门票类型" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="成人票">成人票</SelectItem>
                                    <SelectItem value="儿童票">儿童票</SelectItem>
                                    <SelectItem value="学生票">学生票</SelectItem>
                                    <SelectItem value="老人票">老人票</SelectItem>
                                    <SelectItem value="团体票">团体票</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="price">价格</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={ticketFormData.price || ''}
                                    onChange={(e) => setTicketFormData({ ...ticketFormData, price: parseFloat(e.target.value) || 0 })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="discountPrice">优惠价</Label>
                                <Input
                                    id="discountPrice"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={ticketFormData.discountPrice || ''}
                                    onChange={(e) => setTicketFormData({ ...ticketFormData, discountPrice: parseFloat(e.target.value) || 0 })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="stock">库存</Label>
                                <Input
                                    id="stock"
                                    type="number"
                                    placeholder="-1表示不限"
                                    value={ticketFormData.stock === -1 ? '' : ticketFormData.stock || ''}
                                    onChange={(e) => setTicketFormData({ ...ticketFormData, stock: e.target.value ? parseInt(e.target.value) : -1 })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="validDays">有效期(天)</Label>
                                <Input
                                    id="validDays"
                                    type="number"
                                    placeholder="1"
                                    value={ticketFormData.validDays || ''}
                                    onChange={(e) => setTicketFormData({ ...ticketFormData, validDays: parseInt(e.target.value) || 1 })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="ticketDescription">描述</Label>
                            <Textarea
                                id="ticketDescription"
                                placeholder="请输入门票描述"
                                value={ticketFormData.description || ''}
                                onChange={(e) => setTicketFormData({ ...ticketFormData, description: e.target.value })}
                                rows={2}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="ticketStatus">状态</Label>
                            <Select
                                value={ticketFormData.status?.toString() || '1'}
                                onValueChange={(value) => setTicketFormData({ ...ticketFormData, status: parseInt(value) })}
                            >
                                <SelectTrigger id="ticketStatus">
                                    <SelectValue placeholder="请选择状态" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">启用</SelectItem>
                                    <SelectItem value="0">禁用</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <div className="flex gap-2">
                            <DialogClose asChild>
                                <Button variant="outline">
                                    取消
                                </Button>
                            </DialogClose>
                            <Button onClick={handleSaveTicket}>
                                保存
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* 游玩项目编辑对话框 */}
            <Dialog open={playItemDialogOpen} onOpenChange={setPlayItemDialogOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            {editingPlayItem ? '编辑游玩项目' : '添加游玩项目'}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="playItemName">项目名称 *</Label>
                            <Input
                                id="playItemName"
                                placeholder="请输入项目名称"
                                value={playItemFormData.name}
                                onChange={(e) => setPlayItemFormData({ ...playItemFormData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="playItemDescription">描述</Label>
                            <Textarea
                                id="playItemDescription"
                                placeholder="请输入项目描述"
                                value={playItemFormData.description || ''}
                                onChange={(e) => setPlayItemFormData({ ...playItemFormData, description: e.target.value })}
                                rows={2}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="duration">时长(分钟)</Label>
                                <Input
                                    id="duration"
                                    type="number"
                                    placeholder="60"
                                    value={playItemFormData.duration || ''}
                                    onChange={(e) => setPlayItemFormData({ ...playItemFormData, duration: parseInt(e.target.value) || 60 })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="playItemPrice">价格</Label>
                                <Input
                                    id="playItemPrice"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={playItemFormData.price || ''}
                                    onChange={(e) => setPlayItemFormData({ ...playItemFormData, price: parseFloat(e.target.value) || 0 })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="playItemDiscountPrice">优惠价</Label>
                            <Input
                                id="playItemDiscountPrice"
                                type="number"
                                step="0.01"
                                placeholder="不设置优惠价"
                                value={playItemFormData.discountPrice || ''}
                                onChange={(e) => setPlayItemFormData({ ...playItemFormData, discountPrice: e.target.value ? parseFloat(e.target.value) : undefined })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="minPerson">最少人数</Label>
                                <Input
                                    id="minPerson"
                                    type="number"
                                    placeholder="1"
                                    value={playItemFormData.minPerson || ''}
                                    onChange={(e) => setPlayItemFormData({ ...playItemFormData, minPerson: parseInt(e.target.value) || 1 })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="maxPerson">最多人数</Label>
                                <Input
                                    id="maxPerson"
                                    type="number"
                                    placeholder="10"
                                    value={playItemFormData.maxPerson || ''}
                                    onChange={(e) => setPlayItemFormData({ ...playItemFormData, maxPerson: parseInt(e.target.value) || 10 })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="minAge">最低年龄</Label>
                                <Input
                                    id="minAge"
                                    type="number"
                                    placeholder="不限制"
                                    value={playItemFormData.minAge || ''}
                                    onChange={(e) => setPlayItemFormData({ ...playItemFormData, minAge: e.target.value ? parseInt(e.target.value) : undefined })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="maxAge">最高年龄</Label>
                                <Input
                                    id="maxAge"
                                    type="number"
                                    placeholder="不限制"
                                    value={playItemFormData.maxAge || ''}
                                    onChange={(e) => setPlayItemFormData({ ...playItemFormData, maxAge: e.target.value ? parseInt(e.target.value) : undefined })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="playItemStatus">状态</Label>
                            <Select
                                value={playItemFormData.status?.toString() || '1'}
                                onValueChange={(value) => setPlayItemFormData({ ...playItemFormData, status: parseInt(value) })}
                            >
                                <SelectTrigger id="playItemStatus">
                                    <SelectValue placeholder="请选择状态" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">启用</SelectItem>
                                    <SelectItem value="0">禁用</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <div className="flex gap-2">
                            <DialogClose asChild>
                                <Button variant="outline">
                                    取消
                                </Button>
                            </DialogClose>
                            <Button onClick={handleSavePlayItem}>
                                保存
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
