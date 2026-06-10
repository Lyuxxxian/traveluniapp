/**
 * 地图兜底数据。坐标为景区范围内估算值，后台地图数据可覆盖这些本地 seed。
 */

const BASE_LAT = 31.421
const BASE_LNG = 120.108

export type MapPointSeedInput = {
  id: number
  title: string
  latitude: number
  longitude: number
  address: string
  desc: string
  openTime?: string
  tags?: string[]
}

function coord(index: number) {
  const row = Math.floor(index / 6)
  const col = index % 6
  return {
    latitude: Number((BASE_LAT + row * 0.0011 - 0.0015).toFixed(6)),
    longitude: Number((BASE_LNG + col * 0.0011 - 0.0015).toFixed(6)),
  }
}

function seeds(
  categoryLabel: string,
  idStart: number,
  titles: string[],
  tag?: string,
): MapPointSeedInput[] {
  return titles.map((title, index) => {
    const { latitude, longitude } = coord(index)
    return {
      id: idStart + index,
      title,
      latitude,
      longitude,
      address: `灵山文旅景区 · ${categoryLabel}`,
      desc: `${title}（坐标待精修，可在后台替换为真实经纬度）`,
      tags: tag ? [tag] : undefined,
    }
  })
}

function numberedTitles(prefix: string, count: number) {
  return Array.from({ length: count }, (_, i) => `${prefix}${i + 1}`)
}

export const MAP_CATEGORIES = [
  { key: 'spot', label: '景点', icon: 'spot', color: '#8b6138', sort: 1 },
  { key: 'toilet', label: '卫生间', icon: 'toilet', color: '#7b9eb3', sort: 2 },
  { key: 'entrance', label: '出入口', icon: 'entrance', color: '#6b7c8f', sort: 3 },
  { key: 'drinking', label: '饮用水', icon: 'drinking', color: '#5a9fb8', sort: 4 },
  { key: 'service', label: '游客服务', icon: 'service', color: '#c4a35a', sort: 5 },
  { key: 'nursery', label: '母婴室', icon: 'nursery', color: '#d4a5a5', sort: 6 },
  { key: 'ticket', label: '售票处', icon: 'ticket', color: '#9b6b4a', sort: 7 },
  { key: 'facility', label: '自助设施', icon: 'facility', color: '#7a8b6a', sort: 8 },
  { key: 'guide', label: '讲解', icon: 'guide', color: '#6f8f6f', sort: 9 },
  { key: 'food', label: '餐饮', icon: 'food', color: '#c77d45', sort: 10 },
  { key: 'shop', label: '商店', icon: 'shop', color: '#b8864f', sort: 11 },
  { key: 'hotel', label: '住宿', icon: 'hotel', color: '#8b7355', sort: 12 },
  { key: 'shuttle', label: '观光车站', icon: 'shuttle', color: '#5c7a9e', sort: 13 },
  { key: 'medical', label: '医务室', icon: 'medical', color: '#c45c5c', sort: 14 },
  { key: 'rest', label: '休息区', icon: 'rest', color: '#9a8b6b', sort: 15 },
  { key: 'smoking', label: '吸烟处', icon: 'smoking', color: '#8a8a8a', sort: 16 },
  { key: 'plant', label: '植物', icon: 'plant', color: '#6b9e6b', sort: 17 },
  { key: 'parking', label: '停车场', icon: 'parking', color: '#8b9a6b', sort: 18 },
]

export const MAP_POINT_SEEDS: Record<string, MapPointSeedInput[]> = {
  spot: [
    { id: 101, title: '灵山大佛', latitude: 31.424230, longitude: 120.081889, address: '灵山文旅景区 · 景点', desc: '景区核心，大佛脚下的位置', tags: ['景点'] },
    { id: 102, title: '九龙灌浴', latitude: 31.423112, longitude: 120.082568, address: '灵山文旅景区 · 景点', desc: '位于大佛正前方的广场喷泉处', tags: ['景点'] },
    { id: 103, title: '阿育王柱', latitude: 31.421687, longitude: 120.083456, address: '灵山文旅景区 · 景点', desc: '位于景区中轴线入口不远处的石柱', tags: ['景点'] },
    { id: 104, title: '曼飞龙塔', latitude: 31.421950, longitude: 120.084450, address: '灵山文旅景区 · 景点', desc: '位于景区东侧，阿育王柱附近', tags: ['景点'] },
    { id: 105, title: '五印坛城', latitude: 31.422760, longitude: 120.081150, address: '灵山文旅景区 · 景点', desc: '位于景区中轴线西侧的藏式建筑', tags: ['景点'] },
    { id: 106, title: '降魔浮雕', latitude: 31.423689, longitude: 120.082050, address: '灵山文旅景区 · 景点', desc: '位于通往大佛的台阶前', tags: ['景点'] },
    ...seeds('景点', 107, [
      '灵山大照壁',
      '佛手广场',
      '祥符禅寺',
      '佛足坛',
      '菩提大道',
      '灵山精舍',
      '百子戏弥勒',
    ], '景点'),
  ],
  toilet: [
    { id: 301, title: '卫生间', latitude: 31.419600, longitude: 120.085800, address: '灵山文旅景区 · 卫生间', desc: '入口大门处', tags: ['卫生间'] },
    { id: 302, title: '卫生间', latitude: 31.421800, longitude: 120.083200, address: '灵山文旅景区 · 卫生间', desc: '阿育王柱广场旁', tags: ['卫生间'] },
    { id: 303, title: '卫生间', latitude: 31.423200, longitude: 120.082700, address: '灵山文旅景区 · 卫生间', desc: '九龙灌浴广场东侧', tags: ['卫生间'] },
    { id: 304, title: '卫生间', latitude: 31.424100, longitude: 120.082200, address: '灵山文旅景区 · 卫生间', desc: '大佛脚下/登云道旁', tags: ['卫生间'] },
    { id: 305, title: '卫生间', latitude: 31.422500, longitude: 120.081300, address: '灵山文旅景区 · 卫生间', desc: '五印坛城附近', tags: ['卫生间'] },
    { id: 306, title: '卫生间', latitude: 31.421500, longitude: 120.084200, address: '灵山文旅景区 · 卫生间', desc: '景区东侧道路', tags: ['卫生间'] },
    { id: 307, title: '卫生间', latitude: 31.424500, longitude: 120.081500, address: '灵山文旅景区 · 卫生间', desc: '大佛景区后方', tags: ['卫生间'] },
    { id: 308, title: '卫生间', latitude: 31.420500, longitude: 120.084500, address: '灵山文旅景区 · 卫生间', desc: '梵宫广场方向', tags: ['卫生间'] },
    { id: 309, title: '卫生间', latitude: 31.422000, longitude: 120.080500, address: '灵山文旅景区 · 卫生间', desc: '梵宫内部或周边', tags: ['卫生间'] },
    ...seeds('卫生间', 310, numberedTitles('卫生间', 3), '卫生间'),
  ],
  entrance: [
    { id: 601, title: '景区入口', latitude: 31.419500, longitude: 120.106500, address: '灵山文旅景区 · 出入口', desc: '景区入口（坐标待精修）', tags: ['出入口'] },
    { id: 602, title: '出入口', latitude: 31.419500, longitude: 120.085900, address: '灵山文旅景区 · 出入口', desc: '胜境门楼（老大门/团队入口）', tags: ['出入口'] },
    { id: 603, title: '出入口', latitude: 31.418850, longitude: 120.086150, address: '灵山文旅景区 · 出入口', desc: '游客中心/散客入口方向', tags: ['出入口'] },
  ],
  drinking: seeds('饮用水', 701, numberedTitles('饮用水', 9), '饮用水'),
  service: seeds('游客服务', 501, [
    '梵宫服务台',
    '五印坛城服务台',
    '假日广场服务台',
    '游客中心',
  ], '服务'),
  nursery: seeds('母婴室', 801, numberedTitles('母婴室', 4), '母婴室'),
  ticket: seeds('售票处', 901, ['综合购票', '圣坛售票'], '售票'),
  facility: [
    ...seeds('自助设施', 1001, numberedTitles('充电宝', 28), '充电宝'),
    ...seeds('自助设施', 1029, numberedTitles('饮料售卖机', 9), '售卖机'),
  ],
  guide: seeds('讲解', 1101, [
    '游客中心租借点',
    '售票中心租借点',
    '导览亭租借点1',
    '导览亭租借点2',
    '假日广场出口归还点',
    '梵宫入口租借点',
    '梵宫出口归还点',
    '精舍前台租借点',
  ], '讲解'),
  food: seeds('餐饮', 201, [
    '半间小食令',
    '吉祥食集',
    '彩虹小食集',
    '如一味咖啡',
    '蔬食馆',
    '灵山五观堂',
    '如愿食令',
    '山边小食令',
  ], '餐饮'),
  shop: seeds('商店', 2101, [
    '福运如愿1',
    '福运如愿2',
    '福应灵山',
    '喜禅福礼',
    '花开有礼',
    '五色福礼',
    '梵华有礼',
    '梵心福礼',
    '福田有礼',
    '印记灵山',
    '福照如愿',
    '福安如愿',
    '欢喜如愿',
    '杏运有礼',
    '莲花有礼',
    '随喜福礼',
    '般若福礼',
  ], '商店'),
  hotel: seeds('住宿', 2201, ['灵山精舍'], '住宿'),
  shuttle: seeds('观光车站', 2301, [
    '大照壁站',
    '佛足坛站',
    '五印坛城站',
    '九龙灌浴站（散客）',
    '曼飞龙塔站',
    '梵宫广场站',
    '蔬食馆站',
    '杏坛广场站（上行）',
  ], '观光车'),
  medical: [
    ...seeds('医务室', 2401, numberedTitles('AED', 5), 'AED'),
    ...seeds('医务室', 2406, numberedTitles('医务室', 2), '医务室'),
  ],
  rest: seeds('休息区', 2501, numberedTitles('休息区', 7), '休息'),
  smoking: seeds('吸烟处', 2601, numberedTitles('吸烟处', 10), '吸烟'),
  plant: seeds('植物', 2701, [
    '垂丝海棠1',
    '垂丝海棠2',
    '垂丝海棠3',
    '玉兰1',
    '玉兰2',
    '牡丹',
  ], '植物'),
  parking: seeds('停车场', 401, ['P1 主停车场', 'P2 东停车场', 'P3 大巴停车场'], '停车'),
}

export const MAP_ROUTES = [
  {
    id: 1,
    title: '历史文化深度游',
    scene: 'culture',
    durationText: '约3小时',
    pointIds: [107, 108, 109, 101, 105, 106],
    desc: '适合对历史、佛教文化、建筑艺术感兴趣的游客，重点讲大照壁、祥符禅寺、大佛、五印坛城与降魔浮雕。',
  },
  {
    id: 2,
    title: '亲子家庭轻松游',
    scene: 'family',
    durationText: '约2.5小时',
    pointIds: [102, 108, 114, 104, 106],
    desc: '适合带孩子轻松游，串联九龙灌浴表演、互动拍照、曼飞龙塔和降魔浮雕，减少高强度步行。',
  },
  {
    id: 3,
    title: '自然风光拍照游',
    scene: 'nature',
    durationText: '约2.5小时',
    pointIds: [110, 102, 111, 101, 105, 113, 104],
    desc: '适合喜欢自然风光、太湖视野和拍照打卡的游客，节奏轻松，兼顾水景、林荫与园林。',
  },
  {
    id: 4,
    title: '禅意慢游祈福线',
    scene: 'relax',
    durationText: '约2小时',
    pointIds: [107, 105, 110, 111, 113, 104],
    desc: '适合祈福、放松和低强度慢游，讲解密度更轻，保留更多休憩与沉浸时间。',
  },
  {
    id: 5,
    title: '景区餐饮线',
    scene: 'food',
    durationText: '约1.5小时',
    pointIds: [201, 202, 203, 206],
    desc: '半间小食令、吉祥食集、彩虹小食集、灵山五观堂。',
  },
]
