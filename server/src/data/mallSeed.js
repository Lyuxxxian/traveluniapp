/** 与 C 端 src/api/mall.ts mock 对齐的商城商品种子（M2-MALL-00：门票/酒店/年卡） */

const ticketProducts = [
  {
    id: 1001,
    type: 'ticket',
    title: '灵山大佛成人票',
    subtitle: '当日可订，扫码入园',
    price: 21000,
    originPrice: 21000,
    coverUrl:
      'https://images.unsplash.com/photo-1600262300671-295cb21f6d06?auto=format&fit=crop&w=600&q=80',
    tags: ['成人票', '即买即用'],
    stock: 999,
    status: 'on_sale',
    coverImages: [
      'https://images.unsplash.com/photo-1600262300671-295cb21f6d06?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80',
    ],
    description:
      '灵山大佛景区成人门票。瞻礼灵山大佛，仰望世界露天青铜释迦牟尼立像，感受佛教文化的庄严与宁静。景区内可游览祥符禅寺、五智门、降魔壁等文化节点，还可参与佛前供奉香花活动。',
    notice:
      '1. 请携带身份证入园。\n2. 同一证件每日限购一张。\n3. 门票当日有效，出园后不可再次入园。\n4. 请妥善保管门票二维码。',
    specs: [{ id: 1, name: '成人票', price: 21000 }],
  },
  {
    id: 1002,
    type: 'ticket',
    title: '灵山大佛半价票',
    subtitle: '6-18周岁及60-69周岁适用',
    price: 10500,
    originPrice: 21000,
    coverUrl:
      'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=600&q=80',
    tags: ['半价票', '需验证身份'],
    stock: 500,
    status: 'on_sale',
    coverImages: [
      'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80',
    ],
    description:
      '适用于6-18周岁未成年人及60-69周岁长者的半价门票，享受与成人票同等的游览权益。购票后需在入园时出示有效身份证件核验年龄。',
    notice:
      '1. 入园时须出示有效身份证件。\n2. 6-18周岁需由成人陪同入园。\n3. 门票当日有效，过期作废。',
    specs: [{ id: 3, name: '半价票', price: 10500 }],
  },
  {
    id: 1003,
    type: 'ticket',
    title: '灵山大佛免票（预约）',
    subtitle: '6岁或1.4米以下及70岁以上',
    price: 0,
    originPrice: 0,
    coverUrl:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=600&q=80',
    tags: ['免票', '需预约'],
    stock: 200,
    status: 'on_sale',
    coverImages: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1200&q=80',
    ],
    description:
      '符合免票资格的游客可预约免费入园。适用人群：6岁（含）以下或身高1.4米（含）以下儿童、70周岁（含）以上长者。需提前在线预约，入园时核验身份。',
    notice:
      '1. 须提前1天在线预约。\n2. 入园时出示有效证件核验年龄。\n3. 儿童需由持票成人陪同入园。',
    specs: [{ id: 4, name: '免票预约', price: 0 }],
  },
  {
    id: 1004,
    type: 'ticket',
    title: '灵山梵宫联票',
    subtitle: '含大佛景区与梵宫文化体验',
    price: 28000,
    originPrice: 32000,
    coverUrl:
      'https://images.unsplash.com/photo-1583037189850-1921ae7c6c2a?auto=format&fit=crop&w=600&q=80',
    tags: ['联票', '含梵宫'],
    stock: 300,
    status: 'on_sale',
    coverImages: [
      'https://images.unsplash.com/photo-1583037189850-1921ae7c6c2a?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80',
    ],
    description:
      '一票畅游灵山大佛景区与灵山梵宫，体验双倍的震撼之旅。灵山大佛景区瞻礼露天青铜大佛，灵山梵宫则带您走进佛教文化艺术的神圣殿堂。含梵宫文化体验活动一次。',
    notice:
      '1. 梵宫文化体验需按现场场次参与。\n2. 联票当日有效。\n3. 请携带身份证入园。',
    specs: [
      { id: 5, name: '成人联票', price: 28000 },
      { id: 6, name: '半价联票', price: 14000 },
    ],
  },
  {
    id: 1005,
    type: 'ticket',
    title: '九龙灌浴套票',
    subtitle: '含大佛景区与九龙灌浴表演',
    price: 26000,
    originPrice: 29000,
    coverUrl:
      'https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=600&q=80',
    tags: ['套票', '含演出'],
    stock: 400,
    status: 'on_sale',
    coverImages: [
      'https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600262300671-295cb21f6d06?auto=format&fit=crop&w=1200&q=80',
    ],
    description:
      '含灵山大佛景区门票与九龙灌浴大型音乐动态群雕表演观赏。九龙灌浴是灵山景区的标志性演出，以吉祥、庄严的氛围展现佛祖诞生的故事，每日多场次上演。',
    notice:
      '1. 九龙灌浴每日场次：10:00, 11:30, 13:30, 15:00。\n2. 请提前10分钟入场。\n3. 套票当日有效。',
    specs: [
      { id: 7, name: '成人套票', price: 26000 },
      { id: 8, name: '半价套票', price: 13000 },
    ],
  },
  {
    id: 1006,
    type: 'ticket',
    title: '灵山精舍禅修体验票',
    subtitle: '含景区门票与精舍半日禅修',
    price: 38800,
    originPrice: 42000,
    coverUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    tags: ['体验票', '含禅修'],
    stock: 100,
    status: 'on_sale',
    coverImages: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1549638441-b787d2e11f14?auto=format&fit=crop&w=1200&q=80',
    ],
    description:
      '深度禅修体验之旅，含灵山大佛景区门票与灵山精舍半日禅修体验。在禅意园林中静坐冥想，跟随师父学习禅修方法，品尝素斋茶点，感受心灵深处的宁静与祥和。',
    notice:
      '1. 禅修体验每日上午场和下午场，请提前确认场次。\n2. 建议穿着宽松舒适衣物。\n3. 体验期间请保持安静。',
    specs: [{ id: 9, name: '禅修体验票', price: 38800 }],
  },
]

const hotelProducts = [
  {
    id: 2001,
    type: 'hotel',
    title: '灵山精舍禅意房',
    subtitle: '含早课体验与素斋早餐',
    price: 68800,
    originPrice: 78800,
    coverUrl:
      'https://images.unsplash.com/photo-1549638441-b787d2e11f14?auto=format&fit=crop&w=600&q=80',
    tags: ['含早课', '含素斋', '禅意园林'],
    stock: 50,
    status: 'on_sale',
    coverImages: [
      'https://images.unsplash.com/photo-1549638441-b787d2e11f14?auto=format&fit=crop&w=1200&q=80',
    ],
    description: '灵山精舍禅意房，推窗见山，含早课体验与素斋早餐，适合慢游休憩。',
    notice: '1. 入住时间 14:00，退房时间 12:00。\n2. 早课体验需提前预约场次。',
    specs: [{ id: 101, name: '禅意大床房', price: 68800 }],
  },
  {
    id: 2002,
    type: 'hotel',
    title: '灵山精舍景观房',
    subtitle: '推窗见山，独享庭院景观',
    price: 88800,
    originPrice: 98800,
    coverUrl:
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=600&q=80',
    tags: ['景观房', '庭院', '含早课'],
    stock: 30,
    status: 'on_sale',
    coverImages: [
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80',
    ],
    description: '景观房位于精舍最佳观景位置，独享庭院景观，含早课体验。',
    notice: '1. 入住需出示身份证件。\n2. 景观房数量有限，建议提前预约。',
    specs: [{ id: 102, name: '景观大床房', price: 88800 }],
  },
]

const annualCardProducts = [
  {
    id: 5001,
    type: 'annualCard',
    title: '灵山年卡（个人）',
    subtitle: '全年无限次入园',
    price: 39800,
    originPrice: 39800,
    coverUrl:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=600&q=80',
    tags: ['年卡', '个人'],
    stock: 9999,
    status: 'on_sale',
    coverImages: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80',
    ],
    description: '灵山年卡个人版，激活后全年无限次入园，适合常来灵山的游客。',
    notice: '1. 年卡自激活日起一年内有效。\n2. 入园需出示年卡二维码及身份证件。',
    specs: [{ id: 201, name: '个人年卡', price: 39800 }],
  },
  {
    id: 5002,
    type: 'annualCard',
    title: '灵山年卡（家庭）',
    subtitle: '两大一小全年无限次入园',
    price: 79800,
    originPrice: 79800,
    coverUrl:
      'https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=600&q=80',
    tags: ['年卡', '家庭'],
    stock: 9999,
    status: 'on_sale',
    coverImages: [
      'https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1200&q=80',
    ],
    description: '灵山年卡家庭版，两大一小全年无限次入园，适合家庭出游。',
    notice: '1. 家庭卡限登记成员使用。\n2. 入园需核验成员身份。',
    specs: [{ id: 202, name: '家庭年卡', price: 79800 }],
  },
]

export const productsSeed = [...ticketProducts, ...hotelProducts, ...annualCardProducts]
