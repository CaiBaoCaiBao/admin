import { request } from "@/config/axios"

// ==================== 类型定义 ====================

export interface UploadResponse {
    url: string
}

export interface UploadProgress {
    loaded: number
    total: number
    percent: number
}

// ==================== API 接口 ====================

const UploadApi = {
    /**
     * 上传图片
     * POST /file/trip-api/upload-img
     */
    uploadImage: async (file: File, onProgress?: (progress: UploadProgress) => void) => {
        const formData = new FormData()
        formData.append('file', file)

        return request.post<{ data: string }>('/file/trip-api/upload-img', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
                if (onProgress && progressEvent.total) {
                    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
                    onProgress({
                        loaded: progressEvent.loaded,
                        total: progressEvent.total,
                        percent,
                    })
                }
            },
        })
    }
}

export default UploadApi
