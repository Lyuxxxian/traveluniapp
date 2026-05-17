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
}

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
    payAmount: 21000,
    quantity: 2,
    createdAt: '2026-05-14 10:00:00',
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
  },
  {
    id: 9003,
    orderNo: 'LS202605130001',
    status: 'completed',
    statusText: '已完成',
    title: '九龙灌浴套票',
    coverUrl: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=400&q=80',
    payAmount: 26000,
    quantity: 1,
    createdAt: '2026-05-13 09:00:00',
  },
  {
    id: 9004,
    orderNo: 'LS202605120001',
    status: 'completed',
    statusText: '已完成',
    title: '灵山大佛半价票',
    coverUrl: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=400&q=80',
    payAmount: 10500,
    quantity: 1,
    createdAt: '2026-05-12 14:30:00',
  },
  {
    id: 9005,
    orderNo: 'LS202605110001',
    status: 'completed',
    statusText: '已完成',
    title: '灵山精舍禅修体验票',
    coverUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    payAmount: 38800,
    quantity: 1,
    createdAt: '2026-05-11 08:00:00',
  },
  {
    id: 9006,
    orderNo: 'LS202605150001',
    status: 'pendingPay',
    statusText: '待付款',
    title: '灵山年卡（个人）',
    coverUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=400&q=80',
    payAmount: 39800,
    quantity: 1,
    createdAt: '2026-05-15 16:00:00',
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
        price: order.payAmount / order.quantity,
      },
    ],
    qrCodeUrl: '',
    payAt: order.status !== 'pendingPay' ? order.createdAt.replace(' ', ' 10:03:00') : '',
    remark: '',
  })
}

export async function cancelOrder(id: number): Promise<void> {
  // TODO: 对接后端 POST /api/orders/:id/cancel
  // return http.post(`/api/orders/${id}/cancel`, undefined, { auth: true })
  return Promise.resolve()
}

export async function mockPayOrder(id: number): Promise<void> {
  // TODO: 对接后端 POST /api/orders/:id/mock-pay
  // return http.post(`/api/orders/${id}/mock-pay`, undefined, { auth: true })
  return Promise.resolve()
}

