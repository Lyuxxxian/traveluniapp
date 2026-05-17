import { http } from '../utils/request'

export type ProductType = 'ticket' | 'hotel' | 'annualCard' | 'couponPackage' | 'food' | 'creative'

export type Product = {
  id: number
  type: ProductType
  title: string
  subtitle: string
  price: number
  originPrice: number
  coverUrl: string
  tags: string[]
  stock: number
}

export type PaginatedResult<T> = {
  page: number
  pageSize: number
  total: number
  list: T[]
}

export type ProductListParams = {
  type?: ProductType
  keyword?: string
  page?: number
  pageSize?: number
}

export type ProductSpec = {
  id: number
  name: string
  price: number
}

export type ProductDetail = Product & {
  coverImages: string[]
  description: string
  notice: string
  specs: ProductSpec[]
}

const staticTicketProducts: Product[] = [
  {
    id: 1001,
    type: 'ticket',
    title: '灵山大佛成人票',
    subtitle: '当日可订，扫码入园',
    price: 21000,
    originPrice: 21000,
    coverUrl: 'https://images.unsplash.com/photo-1600262300671-295cb21f6d06?auto=format&fit=crop&w=600&q=80',
    tags: ['成人票', '即买即用'],
    stock: 999,
  },
  {
    id: 1002,
    type: 'ticket',
    title: '灵山大佛半价票',
    subtitle: '6-18周岁及60-69周岁适用',
    price: 10500,
    originPrice: 21000,
    coverUrl: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=600&q=80',
    tags: ['半价票', '需验证身份'],
    stock: 500,
  },
  {
    id: 1003,
    type: 'ticket',
    title: '灵山大佛免票（预约）',
    subtitle: '6岁或1.4米以下及70岁以上',
    price: 0,
    originPrice: 0,
    coverUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=600&q=80',
    tags: ['免票', '需预约'],
    stock: 200,
  },
  {
    id: 1004,
    type: 'ticket',
    title: '灵山梵宫联票',
    subtitle: '含大佛景区与梵宫文化体验',
    price: 28000,
    originPrice: 32000,
    coverUrl: 'https://images.unsplash.com/photo-1583037189850-1921ae7c6c2a?auto=format&fit=crop&w=600&q=80',
    tags: ['联票', '含梵宫'],
    stock: 300,
  },
  {
    id: 1005,
    type: 'ticket',
    title: '九龙灌浴套票',
    subtitle: '含大佛景区与九龙灌浴表演',
    price: 26000,
    originPrice: 29000,
    coverUrl: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=600&q=80',
    tags: ['套票', '含演出'],
    stock: 400,
  },
  {
    id: 1006,
    type: 'ticket',
    title: '灵山精舍禅修体验票',
    subtitle: '含景区门票与精舍半日禅修',
    price: 38800,
    originPrice: 42000,
    coverUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    tags: ['体验票', '含禅修'],
    stock: 100,
  },
]

const staticHotelProducts: Product[] = [
  {
    id: 2001,
    type: 'hotel',
    title: '灵山精舍禅意房',
    subtitle: '含早课体验与素斋早餐',
    price: 68800,
    originPrice: 78800,
    coverUrl: 'https://images.unsplash.com/photo-1549638441-b787d2e11f14?auto=format&fit=crop&w=600&q=80',
    tags: ['含早课', '含素斋', '禅意园林'],
    stock: 50,
  },
  {
    id: 2002,
    type: 'hotel',
    title: '灵山精舍景观房',
    subtitle: '推窗见山，独享庭院景观',
    price: 88800,
    originPrice: 98800,
    coverUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=600&q=80',
    tags: ['景观房', '庭院', '含早课'],
    stock: 30,
  },
]

const staticFoodProducts: Product[] = [
  {
    id: 3001,
    type: 'food',
    title: '梵宫素斋自助餐',
    subtitle: '灵山梵宫内素斋体验',
    price: 8800,
    originPrice: 8800,
    coverUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    tags: ['素斋', '自助'],
    stock: 500,
  },
  {
    id: 3002,
    type: 'food',
    title: '素面套餐',
    subtitle: '灵山特色素面一碗',
    price: 3800,
    originPrice: 3800,
    coverUrl: 'https://images.unsplash.com/photo-1555126634-323283e090fa?auto=format&fit=crop&w=600&q=80',
    tags: ['素面', '简餐'],
    stock: 800,
  },
]

const staticCreativeProducts: Product[] = [
  {
    id: 4001,
    type: 'creative',
    title: '灵山禅茶礼盒',
    subtitle: '伴手礼与祈福心意精选',
    price: 12800,
    originPrice: 15800,
    coverUrl: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?auto=format&fit=crop&w=600&q=80',
    tags: ['文创', '茶礼'],
    stock: 200,
  },
  {
    id: 4002,
    type: 'creative',
    title: '九龙灌浴圣水瓶',
    subtitle: '限量纪念品，景德镇手工制',
    price: 29800,
    originPrice: 35800,
    coverUrl: 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&w=600&q=80',
    tags: ['限量', '手工'],
    stock: 50,
  },
]

const staticAnnualCardProducts: Product[] = [
  {
    id: 5001,
    type: 'annualCard',
    title: '灵山年卡（个人）',
    subtitle: '全年无限次入园',
    price: 39800,
    originPrice: 39800,
    coverUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=600&q=80',
    tags: ['年卡', '个人'],
    stock: 9999,
  },
  {
    id: 5002,
    type: 'annualCard',
    title: '灵山年卡（家庭）',
    subtitle: '两大一小全年无限次入园',
    price: 79800,
    originPrice: 79800,
    coverUrl: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=600&q=80',
    tags: ['年卡', '家庭'],
    stock: 9999,
  },
]

const allStaticProducts: Record<string, Product[]> = {
  ticket: staticTicketProducts,
  hotel: staticHotelProducts,
  food: staticFoodProducts,
  creative: staticCreativeProducts,
  annualCard: staticAnnualCardProducts,
  couponPackage: [],
}

export async function fetchProducts(params: ProductListParams = {}): Promise<PaginatedResult<Product>> {
  // TODO: 对接后端 GET /api/mall/products
  // return http.get<PaginatedResult<Product>>('/api/mall/products', params, { auth: false })

  const type = params.type || 'ticket'
  const page = params.page || 1
  const pageSize = params.pageSize || 20
  let list = allStaticProducts[type] || []

  if (params.keyword) {
    const keyword = params.keyword.toLowerCase()
    list = list.filter(
      (item) =>
        item.title.toLowerCase().includes(keyword) ||
        item.subtitle.toLowerCase().includes(keyword) ||
        item.tags.some((t) => t.toLowerCase().includes(keyword)),
    )
  }

  const total = list.length
  const start = (page - 1) * pageSize
  const pagedList = list.slice(start, start + pageSize)

  return Promise.resolve({
    page,
    pageSize,
    total,
    list: pagedList,
  })
}

const staticProductDetails: Record<number, ProductDetail> = {
  1001: {
    id: 1001,
    type: 'ticket',
    title: '灵山大佛成人票',
    subtitle: '当日可订，扫码入园',
    price: 21000,
    originPrice: 21000,
    coverUrl: 'https://images.unsplash.com/photo-1600262300671-295cb21f6d06?auto=format&fit=crop&w=600&q=80',
    coverImages: [
      'https://images.unsplash.com/photo-1600262300671-295cb21f6d06?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80',
    ],
    tags: ['成人票', '即买即用'],
    stock: 999,
    description: '灵山大佛景区成人门票。瞻礼灵山大佛，仰望世界露天青铜释迦牟尼立像，感受佛教文化的庄严与宁静。景区内可游览祥符禅寺、五智门、降魔壁等文化节点，还可参与佛前供奉香花活动。',
    notice: '1. 请携带身份证入园。\n2. 同一证件每日限购一张。\n3. 门票当日有效，出园后不可再次入园。\n4. 请妥善保管门票二维码。',
    specs: [
      { id: 1, name: '成人票', price: 21000 },
    ],
  },
  1002: {
    id: 1002,
    type: 'ticket',
    title: '灵山大佛半价票',
    subtitle: '6-18周岁及60-69周岁适用',
    price: 10500,
    originPrice: 21000,
    coverUrl: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=600&q=80',
    coverImages: [
      'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80',
    ],
    tags: ['半价票', '需验证身份'],
    stock: 500,
    description: '适用于6-18周岁未成年人及60-69周岁长者的半价门票，享受与成人票同等的游览权益。购票后需在入园时出示有效身份证件核验年龄。',
    notice: '1. 入园时须出示有效身份证件。\n2. 6-18周岁需由成人陪同入园。\n3. 门票当日有效，过期作废。',
    specs: [
      { id: 3, name: '半价票', price: 10500 },
    ],
  },
  1003: {
    id: 1003,
    type: 'ticket',
    title: '灵山大佛免票（预约）',
    subtitle: '6岁或1.4米以下及70岁以上',
    price: 0,
    originPrice: 0,
    coverUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=600&q=80',
    coverImages: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1200&q=80',
    ],
    tags: ['免票', '需预约'],
    stock: 200,
    description: '符合免票资格的游客可预约免费入园。适用人群：6岁（含）以下或身高1.4米（含）以下儿童、70周岁（含）以上长者。需提前在线预约，入园时核验身份。',
    notice: '1. 须提前1天在线预约。\n2. 入园时出示有效证件核验年龄。\n3. 儿童需由持票成人陪同入园。',
    specs: [
      { id: 4, name: '免票预约', price: 0 },
    ],
  },
  1004: {
    id: 1004,
    type: 'ticket',
    title: '灵山梵宫联票',
    subtitle: '含大佛景区与梵宫文化体验',
    price: 28000,
    originPrice: 32000,
    coverUrl: 'https://images.unsplash.com/photo-1583037189850-1921ae7c6c2a?auto=format&fit=crop&w=600&q=80',
    coverImages: [
      'https://images.unsplash.com/photo-1583037189850-1921ae7c6c2a?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80',
    ],
    tags: ['联票', '含梵宫'],
    stock: 300,
    description: '一票畅游灵山大佛景区与灵山梵宫，体验双倍的震撼之旅。灵山大佛景区瞻礼露天青铜大佛，灵山梵宫则带您走进佛教文化艺术的神圣殿堂。含梵宫文化体验活动一次。',
    notice: '1. 梵宫文化体验需按现场场次参与。\n2. 联票当日有效。\n3. 请携带身份证入园。',
    specs: [
      { id: 5, name: '成人联票', price: 28000 },
      { id: 6, name: '半价联票', price: 14000 },
    ],
  },
  1005: {
    id: 1005,
    type: 'ticket',
    title: '九龙灌浴套票',
    subtitle: '含大佛景区与九龙灌浴表演',
    price: 26000,
    originPrice: 29000,
    coverUrl: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=600&q=80',
    coverImages: [
      'https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600262300671-295cb21f6d06?auto=format&fit=crop&w=1200&q=80',
    ],
    tags: ['套票', '含演出'],
    stock: 400,
    description: '含灵山大佛景区门票与九龙灌浴大型音乐动态群雕表演观赏。九龙灌浴是灵山景区的标志性演出，以吉祥、庄严的氛围展现佛祖诞生的故事，每日多场次上演。',
    notice: '1. 九龙灌浴每日场次：10:00, 11:30, 13:30, 15:00。\n2. 请提前10分钟入场。\n3. 套票当日有效。',
    specs: [
      { id: 7, name: '成人套票', price: 26000 },
      { id: 8, name: '半价套票', price: 13000 },
    ],
  },
  1006: {
    id: 1006,
    type: 'ticket',
    title: '灵山精舍禅修体验票',
    subtitle: '含景区门票与精舍半日禅修',
    price: 38800,
    originPrice: 42000,
    coverUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    coverImages: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1549638441-b787d2e11f14?auto=format&fit=crop&w=1200&q=80',
    ],
    tags: ['体验票', '含禅修'],
    stock: 100,
    description: '深度禅修体验之旅，含灵山大佛景区门票与灵山精舍半日禅修体验。在禅意园林中静坐冥想，跟随师父学习禅修方法，品尝素斋茶点，感受心灵深处的宁静与祥和。',
    notice: '1. 禅修体验每日上午场和下午场，请提前确认场次。\n2. 建议穿着宽松舒适衣物。\n3. 体验期间请保持安静。',
    specs: [
      { id: 9, name: '禅修体验票', price: 38800 },
    ],
  },
}

export async function fetchProductDetail(id: number): Promise<ProductDetail> {
  // TODO: 对接后端 GET /api/mall/products/:id
  // return http.get<ProductDetail>(`/api/mall/products/${id}`, undefined, { auth: false })

  const detail = staticProductDetails[id]
  if (detail) return Promise.resolve(detail)

  const allProducts = Object.values(allStaticProducts).flat()
  const product = allProducts.find((p) => p.id === id)
  if (!product) return Promise.reject(new Error('商品不存在'))

  return Promise.resolve({
    ...product,
    coverImages: [product.coverUrl],
    description: `${product.title}，${product.subtitle}。`,
    notice: '请以景区现场公告为准。',
    specs: [{ id: 0, name: '默认规格', price: product.price }],
  })
}
