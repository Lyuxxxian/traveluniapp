type BehaviorInsight = {
  sourceType: string
  visits: number
  avgStay: string
  avgSatisfaction: string
  insight: string
}

type ScenicRoute = {
  id: string
  title: string
  scene: string
  interests: string[]
  keywords: string[]
  duration: string
  route: string[]
  focus: string[]
  behaviorBasis: BehaviorInsight[]
  suitableFor: string
  tip: string
}

const behaviorInsights: Record<string, BehaviorInsight> = {
  history: {
    sourceType: '历史文化、博物馆与展馆',
    visits: 21401,
    avgStay: '约2-3小时',
    avgSatisfaction: '4.48/5',
    insight: '历史文化类游客满意度高，适合把讲解重点放在故事、建筑、工艺和文化脉络上。',
  },
  nature: {
    sourceType: '自然公园、风景名胜与休闲度假',
    visits: 37399,
    avgStay: '约3-4小时',
    avgSatisfaction: '4.06/5',
    insight: '自然风光类游客停留稳定，更关注观景、拍照、轻松步行和休憩节奏。',
  },
  family: {
    sourceType: '主题乐园、亲子互动与表演体验',
    visits: 33826,
    avgStay: '约2.5-4小时',
    avgSatisfaction: '3.33/5',
    insight: '亲子游客停留时间较长，需要控制步行强度，并安排表演、互动和补给点。',
  },
  leisure: {
    sourceType: '古镇水乡、休闲度假与慢游人群',
    visits: 57246,
    avgStay: '约2小时',
    avgSatisfaction: '3.52/5',
    insight: '休闲慢游人群规模大，适合提供低强度、强氛围、可随时停留的路线。',
  },
}

export const personalizedRoutes: ScenicRoute[] = [
  {
    id: 'history-culture',
    title: '历史文化深度线',
    scene: 'history',
    interests: ['历史', '文化', '佛教', '建筑', '艺术', '文史'],
    keywords: ['历史', '文化', '佛教', '文史', '古寺', '建筑', '艺术', '深度', '讲解'],
    duration: '约3小时',
    route: ['南门入园', '灵山大照壁', '佛手广场', '祥符禅寺', '灵山大佛', '灵山梵宫', '五印坛城'],
    focus: [
      '灵山大照壁：从“灵山胜境”题刻切入景区佛教文化定位。',
      '祥符禅寺：重点讲唐代古刹、银杏、古井与灵山历史源流。',
      '灵山大佛：讲解88米露天青铜佛像、216级登云道和造像工艺。',
      '梵宫与五印坛城：突出木雕、琉璃、壁画、坛城建筑和汉藏佛教艺术差异。',
    ],
    behaviorBasis: [behaviorInsights.history],
    suitableFor: '适合对历史、建筑、佛教文化和深度讲解感兴趣的游客。',
    tip: '建议上午入园，先走文化主轴，梵宫演出场次可作为中途休息节点。',
  },
  {
    id: 'nature-photo',
    title: '自然风光轻松线',
    scene: 'nature',
    interests: ['自然风光', '拍照', '太湖', '园林', '慢游', '风景'],
    keywords: ['自然', '风光', '风景', '太湖', '拍照', '摄影', '园林', '轻松', '慢游'],
    duration: '约2.5小时',
    route: ['南门入园', '佛足坛', '九龙灌浴', '菩提大道', '灵山大佛观景平台', '曼飞龙塔', '灵山精舍', '梵宫广场'],
    focus: [
      '佛足坛与九龙灌浴：适合拍动态水景和仪式感画面。',
      '菩提大道：讲解菩提树意象，同时安排林荫慢行。',
      '大佛观景平台：俯瞰太湖、马山半岛和景区中轴景观。',
      '灵山精舍：收束到禅意园林与素斋体验，节奏更舒缓。',
    ],
    behaviorBasis: [behaviorInsights.nature],
    suitableFor: '适合喜欢自然风光、拍照打卡、低强度步行的游客。',
    tip: '下午光线更适合拍太湖和大佛剪影，天气热时可把梵宫提前作为室内停留点。',
  },
  {
    id: 'family-interaction',
    title: '亲子互动体验线',
    scene: 'family',
    interests: ['亲子', '孩子', '家庭', '互动', '表演', '轻松'],
    keywords: ['亲子', '孩子', '小朋友', '儿童', '家庭', '表演', '互动', '轻松', '老人'],
    duration: '约2-2.5小时',
    route: ['南门入园', '九龙灌浴', '佛手广场', '百子戏弥勒', '灵山梵宫', '五印坛城'],
    focus: [
      '九龙灌浴：用释迦牟尼诞生故事做儿童友好讲解。',
      '佛手广场：安排“摸佛手、抱佛脚”等互动体验。',
      '百子戏弥勒：适合亲子拍照，并讲“皆大欢喜”的生活寓意。',
      '梵宫与五印坛城：减少术语，多讲颜色、造型、壁画和转经筒体验。',
    ],
    behaviorBasis: [behaviorInsights.family],
    suitableFor: '适合带孩子、老人或希望少走路但体验丰富的家庭游客。',
    tip: '建议把表演时间作为路线锚点，提前10分钟到九龙灌浴或梵宫圣坛占位。',
  },
  {
    id: 'leisure-healing',
    title: '禅意慢游放松线',
    scene: 'leisure',
    interests: ['休闲', '放松', '疗愈', '祈福', '慢游', '素斋'],
    keywords: ['休闲', '放松', '疗愈', '祈福', '慢慢', '安静', '素斋', '禅意', '不累'],
    duration: '约2小时',
    route: ['南门入园', '灵山大照壁', '五明桥', '佛足坛', '菩提大道', '灵山精舍', '梵宫广场'],
    focus: [
      '大照壁与五明桥：以入园仪式感和“五明智慧”做轻讲解。',
      '佛足坛：停留祈福，讲32种吉祥瑞相的寓意。',
      '菩提大道：安排安静步行，降低信息密度。',
      '灵山精舍：推荐素斋、休憩和园林观景。',
    ],
    behaviorBasis: [behaviorInsights.leisure, behaviorInsights.nature],
    suitableFor: '适合想放松、祈福、少赶路或不想听太密集讲解的游客。',
    tip: '这条线可以边走边停，如果游客体力下降，可直接从精舍或梵宫广场结束。',
  },
]

const recommendationIntentWords = ['推荐', '路线', '线路', '游览', '怎么玩', '怎么逛', '兴趣', '个性化', '安排', '导览']

function scoreRoute(question: string, route: ScenicRoute) {
  const keywordScore = route.keywords.reduce((score, keyword) => (
    question.includes(keyword) ? score + 2 : score
  ), 0)
  const interestScore = route.interests.reduce((score, interest) => (
    question.includes(interest) ? score + 1 : score
  ), 0)
  return keywordScore + interestScore
}

function formatBehaviorBasis(items: BehaviorInsight[]) {
  return items
    .map((item) => `${item.sourceType}行为样本${item.visits}条，平均停留${item.avgStay}，满意度${item.avgSatisfaction}`)
    .join('；')
}

function formatRouteRecommendation(route: ScenicRoute) {
  return [
    `我按您的兴趣推荐「${route.title}」（${route.duration}）。`,
    `路线：${route.route.join(' -> ')}。`,
    `讲解重点：${route.focus.join(' ')}`,
    `推荐依据：${formatBehaviorBasis(route.behaviorBasis)}。${route.behaviorBasis.map((item) => item.insight).join('')}`,
    `${route.suitableFor}${route.tip}`,
  ].join('\n\n')
}

function formatRecommendationMenu() {
  const options = personalizedRoutes
    .map((route) => `「${route.title}」：${route.interests.slice(0, 4).join('、')}`)
    .join('\n')

  return `可以的。您可以告诉我偏好，例如“我对历史感兴趣”“喜欢自然风光”“带孩子轻松玩”或“想祈福慢游”。\n\n我当前可推荐：\n${options}`
}

export function matchPersonalizedRecommendation(question: string): string {
  const q = question.trim()
  if (!q) return ''

  const hasIntent = recommendationIntentWords.some((word) => q.includes(word))
  const scored = personalizedRoutes
    .map((route) => ({ route, score: scoreRoute(q, route) }))
    .sort((a, b) => b.score - a.score)

  if (scored[0]?.score > 0) {
    return formatRouteRecommendation(scored[0].route)
  }

  if (hasIntent) {
    return formatRecommendationMenu()
  }

  return ''
}
