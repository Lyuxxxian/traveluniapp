export type DiscoverPost = {
  id: number
  title: string
  subtitle: string
  priceText: string
  coverUrl: string
}

export type DiscoverPostDetail = DiscoverPost & {
  place: string
  joinWay: string
  durationText: string
  contentText: string
  meaningText: string
  detailImageUrl: string
}

const staticPosts: DiscoverPost[] = [
  {
    id: 1,
    title: '梵宫文化体验',
    subtitle: '灵山梵宫',
    priceText: '免费',
    coverUrl:
      'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80',
  },
]

const staticDetail: DiscoverPostDetail = {
  ...staticPosts[0],
  place: '灵山梵宫廊所庭',
  joinWay: '点击“立即预约”即可参与',
  durationText: '约15分钟',
  contentText: '伴随佛通宝塔升起，游客朋友们可以沉浸式体验佛前供奉香花活动。',
  meaningText: '带您走进佛教文化艺术的神圣殿堂，通过禅圣庄严的供花仪式，让您感受一次洗涤心灵的文化之旅。',
  detailImageUrl:
    'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80',
}

export async function fetchDiscoverPosts(): Promise<DiscoverPost[]> {
  // TODO: 对接后端
  // return uni.request({ url: '/api/discover/posts', method: 'GET' }).then(...)
  return Promise.resolve(staticPosts)
}

export async function fetchDiscoverPostDetail(id: number): Promise<DiscoverPostDetail> {
  // TODO: 对接后端
  // return uni.request({ url: `/api/discover/posts/${id}`, method: 'GET' }).then(...)
  if (id === staticDetail.id) return Promise.resolve(staticDetail)
  return Promise.resolve({ ...staticDetail, id })
}

