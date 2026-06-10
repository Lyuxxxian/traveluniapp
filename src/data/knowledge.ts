import { documentKnowledge } from './documentKnowledge'
export const scenicKnowledge = [
  {
    keywords: ['灵山大佛', '大佛', '多高', '高度'],
    answer:
      '灵山大佛是灵山胜境的核心地标，佛像通高88米，含台基总高约101.5米，耗铜量约725吨，是著名的露天青铜释迦牟尼立像。推荐登顶抱佛脚，可以俯瞰太湖风光。'
  },
  {
    keywords: ['九龙灌浴', '演出', '几点', '表演时间'],
    answer:
      '九龙灌浴是灵山胜境的标志性动态景观，平日演出时间一般为10:00、11:30、13:30、15:00，节假日会增加场次，建议提前10分钟到广场占位观看。'
  },
  {
    keywords: ['梵宫', '灵山梵宫', '吉祥颂'],
    answer:
      '灵山梵宫被誉为佛教艺术殿堂，建筑面积约7.2万平方米，内部融合东阳木雕、琉璃、壁画、景泰蓝等传统工艺。《吉祥颂》演出通常在10:35、11:30、14:00、16:00举行。'
  },
  {
    keywords: ['五印坛城', '藏传佛教', '转经'],
    answer:
      '五印坛城是灵山胜境中展示藏传佛教文化的重要景点，建筑具有金顶红墙、经幡飘扬的特色。游客可以体验转经筒，感受“转经一圈，福慧双增”的祈福寓意。'
  },
  {
    keywords: ['祥符禅寺', '古寺', '千年古刹'],
    answer:
      '祥符禅寺始建于唐代贞观年间，是灵山佛教文化的重要根基。寺内有千年银杏、六角井、八角井和祥符禅钟，适合礼佛祈福、了解灵山历史。'
  },
  {
    keywords: ['亲子', '孩子', '带小孩', '家庭'],
    answer:
      '亲子游推荐路线：南门入园→九龙灌浴→佛手广场→百子戏弥勒→灵山梵宫→五印坛城→出口。路线轻松，适合孩子观看表演、互动拍照和了解传统文化。'
  },
  {
    keywords: ['历史文化', '历史路线', '文化路线'],
    answer:
      '历史文化路线推荐：南门入园→灵山大照壁→佛手广场→祥符禅寺→灵山大佛→灵山梵宫→五印坛城→出口。适合想深入了解佛教文化和建筑艺术的游客。'
  },
  {
    keywords: ['自然风光', '拍照', '风景', '太湖'],
    answer:
      '自然风光路线推荐：南门入园→佛足坛→九龙灌浴→菩提大道→灵山大佛→曼飞龙塔→灵山精舍→梵宫广场。适合拍照、看太湖风光和轻松游览。'
  },
  {
    keywords: ['门票', '多少钱', '票价'],
    answer:
      '灵山胜境门票价格会根据淡旺季和平台活动变化，成人票常见参考价约210元，学生、老人等人群通常有优惠，实际以景区当天公告或购票平台为准。'
  },
  {
    keywords: ['开放时间', '几点开门', '几点关门'],
    answer:
      '灵山胜境常规开放时间一般为8:00-17:00，部分展馆或冬季闭馆时间可能提前，建议出行前以景区官方公告为准。'
  }
]

export function matchLocalKnowledge(question: string): string {
  const q = question.toLowerCase()

  const item = scenicKnowledge.find(item =>
    item.keywords.some(keyword => q.includes(keyword.toLowerCase()))
  )

  return item ? item.answer : ''
}
export function matchDocumentKnowledge(question: string): string {
  const q = question.toLowerCase()

  const scored = documentKnowledge
    .map(item => {
      const content = item.content.toLowerCase()
      let score = 0

      q.split('').forEach(char => {
        if (content.includes(char)) score++
      })

      return {
        ...item,
        score
      }
    })
    .filter(item => item.score > 3)
    .sort((a, b) => b.score - a.score)

  if (!scored.length) return ''

  const top = scored[0].content

  return top.length > 260 ? top.slice(0, 260) + '……' : top
}