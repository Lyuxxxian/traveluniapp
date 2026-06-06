import { API_PATHS } from '../config/api'
import { getToken } from '../utils/auth'
import { http } from '../utils/request'

export type OrderStatus = 'all' | 'pendingPay' | 'pendingUse' | 'completed' | 'cancelled' | 'refunded'

const AUTH_OPTS = { showErrorToast: true } as const

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
  productType: string
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
    productType: 'ticket',
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
    productType: 'ticket',
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
    productType: 'ticket',
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
    productType: 'ticket',
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
    productType: 'ticket',
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
    productType: 'annualCard',
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
    productType: 'ticket',
  },
]

export type PaginatedOrders = {
  page: number
  pageSize: number
  total: number
  list: OrderItem[]
}

export async function fetchOrdersByStatus(status: OrderStatus): Promise<OrderItem[]> {
  if (!getToken()) return []
  const params = status === 'all' ? {} : { status }
  return http.get<OrderItem[]>(API_PATHS.orders.list, params, AUTH_OPTS)
}

export async function fetchOrderDetail(id: number): Promise<OrderDetail> {
  if (!getToken()) return Promise.reject(new Error('请先登录'))
  return http.get<OrderDetail>(`${API_PATHS.orders.detail}/${id}`, undefined, AUTH_OPTS)
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

export async function createOrder(params: {
  title: string
  coverUrl: string
  items: CreateOrderItem[]
  couponId?: number
  productType?: string
}): Promise<CreateOrderResult> {
  if (!getToken()) return Promise.reject(new Error('请先登录'))
  return http.post<CreateOrderResult>(API_PATHS.orders.create, params, AUTH_OPTS)
}

export async function cancelOrder(id: number): Promise<void> {
  if (!getToken()) return Promise.reject(new Error('请先登录'))
  await http.post(`${API_PATHS.orders.cancel}/${id}/cancel`, undefined, AUTH_OPTS)
}

export async function mockPayOrder(id: number): Promise<void> {
  if (!getToken()) return Promise.reject(new Error('请先登录'))
  await http.post(`${API_PATHS.orders.mockPay}/${id}/mock-pay`, undefined, AUTH_OPTS)
}

export async function fetchMyCoupons(): Promise<UserCoupon[]> {
  if (!getToken()) return []
  return http.get<UserCoupon[]>(API_PATHS.user.coupons, undefined, AUTH_OPTS)
}

export async function addUserCoupon(couponPackageId: number): Promise<UserCoupon> {
  if (!getToken()) return Promise.reject(new Error('请先登录'))
  return http.post<UserCoupon>(API_PATHS.user.coupons, { couponPackageId }, AUTH_OPTS)
}

export async function getAvailableCouponsForOrder(
  orderAmount: number,
  productType: string,
): Promise<UserCoupon[]> {
  if (!getToken()) return []
  return http.get<UserCoupon[]>(API_PATHS.user.couponsAvailable, { amount: orderAmount, type: productType }, AUTH_OPTS)
}

