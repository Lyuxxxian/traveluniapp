export type MapPointStatus = 'open' | 'closed' | 'busy'

export type MapCategory = {
  key: string
  label: string
  icon: string
  color: string
  sort: number
}

export type MapPoint = {
  id: number
  category: string
  title: string
  latitude: number
  longitude: number
  address: string
  desc: string
  openTime?: string
  status?: MapPointStatus
  tags?: string[]
  iconKey?: string
}

export type MapPointDetail = MapPoint & {
  images?: string[]
  suggestedDuration?: string
  serviceTags?: string[]
  relatedShowIds?: number[]
  relatedProductIds?: number[]
}

export type MapPointInput = Omit<MapPoint, 'id'> & {
  images?: string[]
  suggestedDuration?: string
  serviceTags?: string[]
  relatedShowIds?: number[]
  relatedProductIds?: number[]
}

export type MapPointListQuery = {
  page?: number
  pageSize?: number
  category?: string
  keyword?: string
  status?: MapPointStatus | ''
}
