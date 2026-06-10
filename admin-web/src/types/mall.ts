export type ProductType =
  | 'ticket'
  | 'hotel'
  | 'annualCard'
  | 'couponPackage'
  | 'food'
  | 'creative'

export type ProductStatus = 'on_sale' | 'off_sale'

export type StoreProduct = {
  id: number
  type: ProductType
  title: string
  subtitle: string
  price: number
  originPrice: number
  coverUrl: string
  tags: string[]
  stock: number
  status: ProductStatus
  coverImages?: string[]
  description?: string
  notice?: string
  specs?: { id: number; name: string; price: number }[]
}

export type MallProductListQuery = {
  type?: ProductType
  keyword?: string
  status?: ProductStatus
  page?: number
  pageSize?: number
}

export type OrderStatus =
  | 'pendingPay'
  | 'pendingUse'
  | 'completed'
  | 'cancelled'
  | 'refunded'

export type AdminOrderListItem = {
  id: number
  userId: number
  userPhone?: string
  userNickname?: string
  orderNo: string
  status: OrderStatus
  statusText: string
  title: string
  coverUrl: string
  payAmount: number
  quantity: number
  createdAt: string
  couponDiscount?: number
  couponTitle?: string
  productType?: ProductType
}

export type AdminOrderDetail = AdminOrderListItem & {
  items: { title: string; skuName: string; quantity: number; price: number }[]
  qrCodeUrl?: string
  payAt?: string
  remark?: string
}

export type AdminOrderListQuery = {
  status?: OrderStatus | 'all'
  userId?: number
  keyword?: string
  page?: number
  pageSize?: number
}
