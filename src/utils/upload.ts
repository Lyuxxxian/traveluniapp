/// <reference types="@dcloudio/types" />

import { API_BASE_URL, API_PATHS } from '../config/api'
import { getToken } from './auth'

export type UploadImageResult = {
  url: string
  localPath: string
}

export type ChooseAndUploadImageOptions = {
  count?: number
  sourceType?: Array<'album' | 'camera'>
  sizeType?: Array<'original' | 'compressed'>
}

function parseUploadResponse(data: string): string {
  try {
    const parsed = JSON.parse(data)
    return parsed?.data?.url || ''
  } catch (error) {
    return ''
  }
}

export function uploadImage(filePath: string): Promise<UploadImageResult> {
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: `${API_BASE_URL}${API_PATHS.upload.image}`,
      filePath,
      name: 'file',
      header: {
        Authorization: `Bearer ${getToken()}`,
      },
      success: (response) => {
        const remoteUrl = parseUploadResponse(response.data)

        if (remoteUrl) {
          resolve({ url: remoteUrl, localPath: filePath })
          return
        }

        if (import.meta.env.DEV) {
          resolve({ url: filePath, localPath: filePath })
          return
        }

        reject(new Error('图片上传失败'))
      },
      fail: (error) => {
        if (import.meta.env.DEV) {
          resolve({ url: filePath, localPath: filePath })
          return
        }

        reject(new Error(error.errMsg || '图片上传失败'))
      },
    })
  })
}

export function chooseAndUploadImage(options: ChooseAndUploadImageOptions = {}): Promise<UploadImageResult> {
  return new Promise((resolve, reject) => {
    uni.chooseImage({
      count: options.count || 1,
      sizeType: options.sizeType || ['compressed'],
      sourceType: options.sourceType || ['album', 'camera'],
      success: async (result) => {
        const filePath = result.tempFilePaths[0]
        if (!filePath) {
          reject(new Error('未选择图片'))
          return
        }

        try {
          const uploadResult = await uploadImage(filePath)
          resolve(uploadResult)
        } catch (error) {
          reject(error)
        }
      },
      fail: (error) => {
        reject(new Error(error.errMsg || '未选择图片'))
      },
    })
  })
}
