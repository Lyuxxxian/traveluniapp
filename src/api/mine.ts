export type OrderStatus = 'all' | 'pendingPay' | 'pendingUse' | 'completed'

export type OrderItem = {
  id: number
  title: string
  timeText: string
  amountText: string
}

export type OrderDetail = {
  id: number
  status: OrderStatus
  title: string
  timeText: string
  amountText: string
  contentText: string
}

// TODO: 对接后端
export async function fetchUserName(): Promise<string> {
  // return uni.request({ url: '/api/user/name', method: 'GET' }).then(...)
  return Promise.resolve('游客qn8kn1')
}

// TODO: 对接后端
export async function fetchOrdersByStatus(status: OrderStatus): Promise<OrderItem[]> {
  // return uni.request({ url: `/api/orders?status=${status}`, method: 'GET' }).then(...)
  // 暂时给空列表，页面呈现“暂无订单”
  return Promise.resolve([])
}

// TODO: 对接后端（如果你后续需要“单笔订单详情”）
export async function fetchOrderDetail(id: number): Promise<OrderDetail> {
  // return uni.request({ url: `/api/orders/${id}`, method: 'GET' }).then(...)
  return Promise.resolve({
    id,
    status: 'all',
    title: '梵宫文化体验',
    timeText: '2026-04-29 15:30',
    amountText: '免费',
    contentText: '订单详情接口待接入（静态占位）。',
  })
}

