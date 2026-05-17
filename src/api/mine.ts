export type OrderStatus = 'all' | 'pendingPay' | 'pendingUse' | 'completed' | 'cancelled' | 'refunded'

export type OrderItem = {
  id: number
  orderNo: string
  status: OrderStatus
  statusText: string
  title: string
  coverUrl: string
  payAmount: number
  quantity: number
  createdAt: string
  couponDiscount: number
  couponTitle: string
}

export type OrderDetail = OrderItem & {
  items: {
    title: string
    skuName: string
    quantity: number
    price: number
  }[]
  qrCodeUrl: string
  payAt: string
  remark: string
  couponDiscount: number
  couponTitle: string
}

export type UserCoupon = {
  id: number
  couponPackageId: number
  title: string
  subtitle: string
  minAmount: number
  discountAmount: number
  scopeLabel: string
  scopeTypes: string[]
  coverUrl: string
  validFrom: string
  validTo: string
  status: 'available' | 'used' | 'expired'
}

const couponMetaMap: Record<number, Omit<UserCoupon, 'id' | 'status' | 'validFrom' | 'validTo'>> = {
  6001: {
    couponPackageId: 6001,
    title: '满200减20',
    subtitle: '门票、酒店、年卡通用',
    minAmount: 20000,
    discountAmount: 2000,
    scopeLabel: '通用',
    scopeTypes: ['ticket', 'hotel', 'annualCard'],
    coverUrl: 'https://images.unsplash.com/photo-1553729459-afe8f2e2db29?auto=format&fit=crop&w=400&q=80',
  },
  6002: {
    couponPackageId: 6002,
    title: '满100减10',
    subtitle: '仅限门票使用',
    minAmount: 10000,
    discountAmount: 1000,
    scopeLabel: '门票',
    scopeTypes: ['ticket'],
    coverUrl: 'https://images.unsplash.com/photo-1600262300671-295cb21f6d06?auto=format&fit=crop&w=400&q=80',
  },
  6003: {
    couponPackageId: 6003,
    title: '满500减50',
    subtitle: '仅限酒店使用',
    minAmount: 50000,
    discountAmount: 5000,
    scopeLabel: '酒店',
    scopeTypes: ['hotel'],
    coverUrl: 'https://images.unsplash.com/photo-1549638441-b787d2e11f14?auto=format&fit=crop&w=400&q=80',
  },
  6004: {
    couponPackageId: 6004,
    title: '满300减30',
    subtitle: '仅限年卡使用',
    minAmount: 30000,
    discountAmount: 3000,
    scopeLabel: '年卡',
    scopeTypes: ['annualCard'],
    coverUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=400&q=80',
  },
  6005: {
    couponPackageId: 6005,
    title: '满50减5',
    subtitle: '仅限餐饮使用',
    minAmount: 5000,
    discountAmount: 500,
    scopeLabel: '餐饮',
    scopeTypes: ['food'],
    coverUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80',
  },
  6006: {
    couponPackageId: 6006,
    title: '满100减15',
    subtitle: '仅限文创使用',
    minAmount: 10000,
    discountAmount: 1500,
    scopeLabel: '文创',
    scopeTypes: ['creative'],
    coverUrl: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?auto=format&fit=crop&w=400&q=80',
  },
}

let nextCouponId = 8004

const staticUserCoupons: UserCoupon[] = [
  {
    id: 8001,
    couponPackageId: 6001,
    title: '满200减20',
    subtitle: '门票、酒店、年卡通用',
    minAmount: 20000,
    discountAmount: 2000,
    scopeLabel: '通用',
    scopeTypes: ['ticket', 'hotel', 'annualCard'],
    coverUrl: 'https://images.unsplash.com/photo-1553729459-afe8f2e2db29?auto=format&fit=crop&w=400&q=80',
    validFrom: '2026-05-01',
    validTo: '2026-12-31',
    status: 'available',
  },
  {
    id: 8002,
    couponPackageId: 6002,
    title: '满100减10',
    subtitle: '仅限门票使用',
    minAmount: 10000,
    discountAmount: 1000,
    scopeLabel: '门票',
    scopeTypes: ['ticket'],
    coverUrl: 'https://images.unsplash.com/photo-1600262300671-295cb21f6d06?auto=format&fit=crop&w=400&q=80',
    validFrom: '2026-05-01',
    validTo: '2026-12-31',
    status: 'available',
  },
  {
    id: 8003,
    couponPackageId: 6003,
    title: '满500减50',
    subtitle: '仅限酒店使用',
    minAmount: 50000,
    discountAmount: 5000,
    scopeLabel: '酒店',
    scopeTypes: ['hotel'],
    coverUrl: 'https://images.unsplash.com/photo-1549638441-b787d2e11f14?auto=format&fit=crop&w=400&q=80',
    validFrom: '2026-05-01',
    validTo: '2026-12-31',
    status: 'available',
  },
]

export const statusTextMap: Record<OrderStatus, string> = {
  all: '全部订单',
  pendingPay: '待付款',
  pendingUse: '待使用',
  completed: '已完成',
  cancelled: '已取消',
  refunded: '已退款',
}

export const tabStatuses: { key: OrderStatus; label: string }[] = [
  { key: 'all', label: '全部订单' },
  { key: 'pendingPay', label: '待付款' },
  { key: 'pendingUse', label: '待使用' },
  { key: 'completed', label: '已完成' },
]

const staticOrders: OrderItem[] = [
  {
    id: 9001,
    orderNo: 'LS202605140001',
    status: 'pendingUse',
    statusText: '待使用',
    title: '灵山大佛成人票',
    coverUrl: 'https://images.unsplash.com/photo-1600262300671-295cb21f6d06?auto=format&fit=crop&w=400&q=80',
    payAmount: 19000,
    quantity: 2,
    createdAt: '2026-05-14 10:00:00',
    couponDiscount: 2000,
    couponTitle: '满200减20',
  },
  {
    id: 9002,
    orderNo: 'LS202605140002',
    status: 'pendingPay',
    statusText: '待付款',
    title: '灵山梵宫联票',
    coverUrl: 'https://images.unsplash.com/photo-1583037189850-1921ae7c6c2a?auto=format&fit=crop&w=400&q=80',
    payAmount: 56000,
    quantity: 2,
    createdAt: '2026-05-14 11:00:00',
    couponDiscount: 0,
    couponTitle: '',
  },
  {
    id: 9003,
    orderNo: 'LS202605130001',
    status: 'completed',
    statusText: '已完成',
    title: '九龙灌浴套票',
    coverUrl: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=400&q=80',
    payAmount: 25000,
    quantity: 1,
    createdAt: '2026-05-13 09:00:00',
    couponDiscount: 1000,
    couponTitle: '满100减10',
  },
  {
    id: 9004,
    orderNo: 'LS202605120001',
    status: 'completed',
    statusText: '已完成',
    title: '灵山大佛半价票',
    coverUrl: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=400&q=80',
    payAmount: 9500,
    quantity: 1,
    createdAt: '2026-05-12 14:30:00',
    couponDiscount: 1000,
    couponTitle: '满100减10',
  },
  {
    id: 9005,
    orderNo: 'LS202605110001',
    status: 'completed',
    statusText: '已完成',
    title: '灵山精舍禅修体验票',
    coverUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    payAmount: 36800,
    quantity: 1,
    createdAt: '2026-05-11 08:00:00',
    couponDiscount: 2000,
    couponTitle: '满200减20',
  },
  {
    id: 9006,
    orderNo: 'LS202605150001',
    status: 'pendingPay',
    statusText: '待付款',
    title: '灵山年卡（个人）',
    coverUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=400&q=80',
    payAmount: 36800,
    quantity: 1,
    createdAt: '2026-05-15 16:00:00',
    couponDiscount: 3000,
    couponTitle: '满300减30',
  },
  {
    id: 9007,
    orderNo: 'LS202605150002',
    status: 'pendingUse',
    statusText: '待使用',
    title: '灵山大佛免票（预约）',
    coverUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=400&q=80',
    payAmount: 0,
    quantity: 2,
    createdAt: '2026-05-15 12:00:00',
    couponDiscount: 0,
    couponTitle: '',
  },
]

export type PaginatedOrders = {
  page: number
  pageSize: number
  total: number
  list: OrderItem[]
}

export async function fetchOrdersByStatus(status: OrderStatus): Promise<OrderItem[]> {
  // TODO: 对接后端 GET /api/orders?status=xxx
  // return http.get<OrderItem[]>(`/api/orders`, { status }, { auth: true })

  if (status === 'all') return Promise.resolve([...staticOrders])
  return Promise.resolve(staticOrders.filter((o) => o.status === status))
}

export async function fetchOrderDetail(id: number): Promise<OrderDetail> {
  // TODO: 对接后端 GET /api/orders/:id
  // return http.get<OrderDetail>(`/api/orders/${id}`, undefined, { auth: true })

  const order = staticOrders.find((o) => o.id === id)
  if (!order) return Promise.reject(new Error('订单不存在'))

  return Promise.resolve({
    ...order,
    items: [
      {
        title: order.title,
        skuName: '默认规格',
        quantity: order.quantity,
        price: (order.payAmount + order.couponDiscount) / order.quantity,
      },
    ],
    qrCodeUrl: '',
    payAt: order.status !== 'pendingPay' ? order.createdAt.replace(' ', ' 10:03:00') : '',
    remark: '',
    couponDiscount: order.couponDiscount,
    couponTitle: order.couponTitle,
  })
}

export type CreateOrderItem = {
  productId: number
  skuName: string
  skuPrice: number
  quantity: number
}

export type CreateOrderResult = {
  id: number
  orderNo: string
  payAmount: number
  status: OrderStatus
}

let nextOrderId = 9008

export async function createOrder(params: {
  title: string
  coverUrl: string
  items: CreateOrderItem[]
  couponId?: number
}): Promise<CreateOrderResult> {
  // TODO: 对接后端 POST /api/orders
  // return http.post<CreateOrderResult>('/api/orders', params, { auth: true })

  const id = nextOrderId++
  const totalAmount = params.items.reduce((sum, it) => sum + it.skuPrice * it.quantity, 0)

  let couponDiscount = 0
  let couponTitle = ''
  if (params.couponId) {
    const coupon = staticUserCoupons.find((c) => c.id === params.couponId && c.status === 'available')
    if (coupon && totalAmount >= coupon.minAmount) {
      couponDiscount = coupon.discountAmount
      couponTitle = coupon.title
      coupon.status = 'used'
    }
  }

  const payAmount = totalAmount - couponDiscount
  const orderNo = `LS${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${String(id).padStart(3, '0')}`

  const newOrder: OrderItem = {
    id,
    orderNo,
    status: 'pendingPay',
    statusText: '待付款',
    title: params.title,
    coverUrl: params.coverUrl,
    payAmount,
    quantity: params.items.reduce((sum, it) => sum + it.quantity, 0),
    createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    couponDiscount,
    couponTitle,
  }

  staticOrders.unshift(newOrder)

  return { id, orderNo, payAmount, status: 'pendingPay' }
}

export async function cancelOrder(id: number): Promise<void> {
  // TODO: 对接后端 POST /api/orders/:id/cancel
  // return http.post(`/api/orders/${id}/cancel`, undefined, { auth: true })

  const order = staticOrders.find((o) => o.id === id)
  if (order) {
    order.status = 'cancelled'
    order.statusText = '已取消'
  }
}

export async function mockPayOrder(id: number): Promise<void> {
  // TODO: 对接后端 POST /api/orders/:id/mock-pay
  // return http.post(`/api/orders/${id}/mock-pay`, undefined, { auth: true })

  const order = staticOrders.find((o) => o.id === id)
  if (order) {
    order.status = 'pendingUse'
    order.statusText = '待使用'
  }
}

export async function fetchMyCoupons(): Promise<UserCoupon[]> {
  // TODO: 对接后端 GET /api/user/coupons
  // return http.get<UserCoupon[]>('/api/user/coupons', undefined, { auth: true })

  return Promise.resolve([...staticUserCoupons])
}

export async function addUserCoupon(couponPackageId: number): Promise<UserCoupon> {
  // TODO: 对接后端 POST /api/user/coupons
  // return http.post<UserCoupon>('/api/user/coupons', { couponPackageId }, { auth: true })

  const meta = couponMetaMap[couponPackageId]
  if (!meta) return Promise.reject(new Error('优惠券不存在'))

  const existing = staticUserCoupons.find((c) => c.couponPackageId === couponPackageId && c.status === 'available')
  if (existing) return Promise.reject(new Error('已领取过该优惠券'))

  nextCouponId++
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const validTo = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)
  const vyyyy = validTo.getFullYear()
  const vmm = String(validTo.getMonth() + 1).padStart(2, '0')
  const vdd = String(validTo.getDate()).padStart(2, '0')

  const coupon: UserCoupon = {
    ...meta,
    id: nextCouponId,
    validFrom: `${yyyy}-${mm}-${dd}`,
    validTo: `${vyyyy}-${vmm}-${vdd}`,
    status: 'available',
  }

  staticUserCoupons.push(coupon)
  return Promise.resolve(coupon)
}

export async function getAvailableCouponsForOrder(orderAmount: number, productType: string): Promise<UserCoupon[]> {
  // TODO: 对接后端 GET /api/user/coupons/available?amount=xxx&type=xxx
  // return http.get<UserCoupon[]>(`/api/user/coupons/available`, { amount: orderAmount, type: productType }, { auth: true })

  return Promise.resolve(
    staticUserCoupons.filter(
      (c) =>
        c.status === 'available' &&
        orderAmount >= c.minAmount &&
        (c.scopeTypes.includes(productType) || c.scopeTypes.length >= 3),
    ),
  )
}

