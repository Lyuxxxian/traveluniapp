export const STATUS_TEXT = {
  pendingPay: '待付款',
  pendingUse: '待使用',
  completed: '已完成',
  cancelled: '已取消',
  refunded: '已退款',
}

export const ORDER_STATUSES = new Set(Object.keys(STATUS_TEXT))

const STATUS_TRANSITIONS = {
  pendingPay: new Set(['cancelled', 'pendingUse']),
  pendingUse: new Set(['completed', 'cancelled', 'refunded']),
  completed: new Set(['refunded']),
  cancelled: new Set(),
  refunded: new Set(),
}

export function canTransitionOrderStatus(from, to) {
  if (!ORDER_STATUSES.has(from) || !ORDER_STATUSES.has(to)) return false
  if (from === to) return true
  return STATUS_TRANSITIONS[from]?.has(to) ?? false
}

export function toOrderListItem(order, { forAdmin = false } = {}) {
  const {
    userId,
    items: _items,
    qrCodeUrl: _qr,
    payAt: _payAt,
    remark: _remark,
    ...rest
  } = order
  const row = {
    ...rest,
    statusText: STATUS_TEXT[order.status] || order.status,
  }
  if (forAdmin) {
    row.userId = userId
  }
  return row
}

export function toOrderDetail(order, { forAdmin = false } = {}) {
  return {
    ...toOrderListItem(order, { forAdmin }),
    items: order.items || [],
    qrCodeUrl: order.qrCodeUrl || '',
    payAt: order.payAt || '',
    remark: order.remark || '',
  }
}

export function attachOrderUserInfo(store, orderRow) {
  const user = (store.users || []).find((item) => item.id === orderRow.userId)
  return {
    ...orderRow,
    userPhone: user?.phone || '',
    userNickname: user?.nickname || '',
  }
}

export function filterAdminOrders(orders, query = {}) {
  let list = [...(orders || [])]

  const status = query.status ? String(query.status) : ''
  if (status && status !== 'all') {
    if (!ORDER_STATUSES.has(status)) return { error: '无效的 status' }
    list = list.filter((item) => item.status === status)
  }

  const userId = query.userId !== undefined && query.userId !== '' ? Number(query.userId) : null
  if (userId !== null) {
    if (!Number.isFinite(userId)) return { error: '无效的 userId' }
    list = list.filter((item) => item.userId === userId)
  }

  const keyword = query.keyword ? String(query.keyword).trim().toLowerCase() : ''
  if (keyword) {
    list = list.filter((item) => {
      const haystack = [item.orderNo, item.title].filter(Boolean).join(' ').toLowerCase()
      return haystack.includes(keyword)
    })
  }

  list.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
  return { list }
}
