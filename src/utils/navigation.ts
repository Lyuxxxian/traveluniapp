import type { ContentTarget } from '../api/home'

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
    uni.navigateTo({ url: '/pages/mall/ticket' })
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

  if (target.type === 'toast') {
    uni.showToast({ title: target.message, icon: 'none' })
    return
  }

  uni.showToast({ title: '功能开发中', icon: 'none' })
}
