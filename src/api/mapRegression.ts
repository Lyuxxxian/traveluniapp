import { MAP_CATEGORIES, MAP_POINT_SEEDS, MAP_ROUTES } from './mapData'

/** 契约要求必须保留的 5 类 */
export const FROZEN_CATEGORY_KEYS = ['spot', 'food', 'toilet', 'parking', 'service'] as const

export type MapRegressionReport = {
  passed: boolean
  errors: string[]
  summary: {
    categoryCount: number
    pointCount: number
    routeCount: number
    frozenCategoriesPresent: string[]
  }
}

/** 8a 基础回归：静态数据与契约自检（构建前可运行） */
export function runMapRegressionChecks(): MapRegressionReport {
  const errors: string[] = []
  const ids = new Set<number>()

  Object.entries(MAP_POINT_SEEDS).forEach(([category, seeds]) => {
    if (!seeds.length) {
      errors.push(`分类 ${category} 无点位`)
    }
    seeds.forEach((seed) => {
      if (ids.has(seed.id)) {
        errors.push(`点位 id 重复: ${seed.id}`)
      }
      ids.add(seed.id)
      if (!seed.title?.trim()) errors.push(`点位 ${seed.id} 缺少 title`)
      if (!Number.isFinite(seed.latitude) || !Number.isFinite(seed.longitude)) {
        errors.push(`点位 ${seed.id} 经纬度无效`)
      }
    })
  })

  FROZEN_CATEGORY_KEYS.forEach((key) => {
    const found = MAP_CATEGORIES.some((item) => item.key === key)
    if (!found) errors.push(`缺少冻结分类: ${key}`)
    const points = MAP_POINT_SEEDS[key]
    if (!points?.length) errors.push(`冻结分类 ${key} 无点位`)
  })

  MAP_ROUTES.forEach((route) => {
    route.pointIds.forEach((id) => {
      if (!ids.has(id)) {
        errors.push(`路线 ${route.id} 引用不存在的点位 id: ${id}`)
      }
    })
  })

  const categoryKeys = MAP_CATEGORIES.map((item) => item.key)
  const duplicateCategory = categoryKeys.filter((key, index) => categoryKeys.indexOf(key) !== index)
  if (duplicateCategory.length) {
    errors.push(`分类 key 重复: ${duplicateCategory.join(', ')}`)
  }

  return {
    passed: errors.length === 0,
    errors,
    summary: {
      categoryCount: MAP_CATEGORIES.length,
      pointCount: ids.size,
      routeCount: MAP_ROUTES.length,
      frozenCategoriesPresent: FROZEN_CATEGORY_KEYS.filter((key) =>
        MAP_CATEGORIES.some((item) => item.key === key),
      ),
    },
  }
}
