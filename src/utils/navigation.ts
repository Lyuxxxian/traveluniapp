import type { ContentTarget } from '../api/home'
import type { ReviewTargetType } from '../api/service'
import { isLoggedIn } from './auth'

function buildQuery(params: Record<string, string | number | undefined>): string {
  const query = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== '')
    .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
    .join('&')

  return query ? `?${query}` : ''
}

export function goContentTarget(target?: ContentTarget) {
  if (!target) {
    uni.showToast({ title: '功能开发中', icon: 'none' })
    return
  }

  if (target.type === 'map') {
    uni.navigateTo({
      url: `/pages/map/map${buildQuery({
        category: target.category,
        pointId: target.pointId,
        keyword: target.keyword,
      })}`,
    })
    return
  }

  if (target.type === 'discoverPost') {
    uni.navigateTo({ url: `/pages/discover/discoverDetail?id=${target.id}` })
    return
  }

  if (target.type === 'search') {
    uni.navigateTo({ url: `/pages/search/search${buildQuery({ keyword: target.keyword })}` })
    return
  }

  if (target.type === 'ticket') {
    uni.navigateTo({ url: `/pages/mall/ticket${buildQuery({ mode: target.saleMode })}` })
    return
  }

  if (target.type === 'hotel') {
    uni.navigateTo({ url: '/pages/mall/hotel' })
    return
  }

  if (target.type === 'annualCard') {
    uni.navigateTo({ url: '/pages/mall/annualCard' })
    return
  }

  if (target.type === 'mall') {
    uni.reLaunch({ url: '/pages/mall/mall' })
    return
  }

  if (target.type === 'help') {
    goHelpCenter()
    return
  }

  if (target.type === 'toast') {
    uni.showToast({ title: target.message, icon: 'none' })
    return
  }

  uni.showToast({ title: '功能开发中', icon: 'none' })
}

/** 帮助中心（服务层，不调 AI 对话） */
export function goHelpCenter() {
  uni.navigateTo({ url: '/pages/service/help' })
}

export type ReviewEditQuery = {
  targetType: ReviewTargetType
  targetId: number
  title?: string
  orderId?: number
}

/** 写点评（需登录） */
export function goReviewEdit(query: ReviewEditQuery) {
  if (!isLoggedIn()) {
    uni.navigateTo({ url: '/pages/login/login' })
    return
  }
  uni.navigateTo({
    url: `/pages/mine/reviewEdit${buildQuery({
      targetType: query.targetType,
      targetId: query.targetId,
      title: query.title,
      orderId: query.orderId,
    })}`,
  })
}
