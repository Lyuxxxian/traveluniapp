import type { ContentTarget } from './contentTarget'

/** 与 C 端 src/api/home.ts HomeConfig 对齐 */
export type HomeHeroSlide = {
  id: number
  title: string
  subtitle: string
  kicker: string
  imageUrl: string
  themeColor: string
}

export type HomeMatrixItem = {
  key: string
  title: string
  desc: string
  icon: string
  target?: ContentTarget | null
}

export type HomeActionCard = HomeMatrixItem

export type HomeCollectionItem = {
  id: number
  title: string
  desc: string
  tag: string
  coverUrl?: string
  background: string
  nextShowText?: string
  target?: ContentTarget | null
}

export type HomeCollectionSection = {
  key: string
  title: string
  subtitle?: string
  items: HomeCollectionItem[]
}

export type HomeFeedItem = {
  id: number
  type: string
  title: string
  desc: string
  source: string
  actionText: string
  coverUrl?: string
  background: string
  target?: ContentTarget | null
}

export type HomeConfig = {
  heroSlides: HomeHeroSlide[]
  matrixItems: HomeMatrixItem[]
  actionCards: HomeActionCard[]
  collectionSections: HomeCollectionSection[]
  feedItems: HomeFeedItem[]
}

export function emptyHomeConfig(): HomeConfig {
  return {
    heroSlides: [],
    matrixItems: [],
    actionCards: [],
    collectionSections: [],
    feedItems: [],
  }
}

function nextNum(ids: number[]) {
  return (ids.length ? Math.max(...ids) : 0) + 1
}

export function newHeroSlide(config: HomeConfig): HomeHeroSlide {
  return {
    id: nextNum(config.heroSlides.map((s) => s.id)),
    title: '',
    subtitle: '',
    kicker: '',
    imageUrl: '',
    themeColor: '#f8f1e3',
  }
}

export function newMatrixItem(prefix: string): HomeMatrixItem {
  return {
    key: `${prefix}_${Date.now()}`,
    title: '',
    desc: '',
    icon: 'ticket',
    target: { type: 'ticket' },
  }
}

export function newCollectionItem(config: HomeConfig): HomeCollectionItem {
  const ids = config.collectionSections.flatMap((s) => s.items.map((i) => i.id))
  return {
    id: nextNum(ids),
    title: '',
    desc: '',
    tag: '',
    background: 'linear-gradient(140deg, #888 0%, #ccc 100%)',
    target: { type: 'map', keyword: '' },
  }
}

export function newCollectionSection(): HomeCollectionSection {
  return {
    key: `section_${Date.now()}`,
    title: '新集合栏',
    subtitle: '',
    items: [],
  }
}

export function newFeedItem(config: HomeConfig): HomeFeedItem {
  return {
    id: nextNum(config.feedItems.map((f) => f.id)),
    type: '推荐',
    title: '',
    desc: '',
    source: '',
    actionText: '查看',
    background: 'linear-gradient(140deg, #526f52 0%, #b5c987 100%)',
    target: { type: 'discoverPost', id: 1 },
  }
}

/** 保存前去掉空 target */
export function sanitizeHomeConfig(raw: HomeConfig): HomeConfig {
  const stripTarget = <T extends { target?: ContentTarget | null }>(row: T): T => {
    if (row.target == null) {
      const { target: _t, ...rest } = row
      return rest as T
    }
    return row
  }
  return {
    heroSlides: raw.heroSlides,
    matrixItems: raw.matrixItems.map(stripTarget),
    actionCards: raw.actionCards.map(stripTarget),
    collectionSections: raw.collectionSections.map((sec) => ({
      ...sec,
      items: sec.items.map(stripTarget),
    })),
    feedItems: raw.feedItems.map(stripTarget),
  }
}
