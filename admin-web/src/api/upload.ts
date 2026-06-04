import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

export type UploadImageResult = {
  url: string
}

/** 管理端上传图片，字段名 file，需 admin_token */
export async function uploadImage(file: File): Promise<string> {
  const token = localStorage.getItem('admin_token')
  if (!token) {
    throw new Error('请先登录管理后台')
  }
  const form = new FormData()
  form.append('file', file)
  const res = await axios.post<{ code: number; message: string; data: UploadImageResult }>(
    `${baseURL}/api/upload/image`,
    form,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000,
    },
  )
  if (res.data.code !== 200 || !res.data.data?.url) {
    throw new Error(res.data.message || '图片上传失败')
  }
  return res.data.data.url
}
