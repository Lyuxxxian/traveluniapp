const API_KEY = '96bc9c08-3b6f-410f-9d01-b30a6fe8eb98'

export async function askAI(message: string): Promise<string> {
  try {
    const response = await fetch(
      'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: 'doubao-seed-2-0-lite-260428',
          messages: [
            {
              role: 'system',
              content:
                '你是灵山胜境景区AI数字人导游“灵儿”。你说话温柔、自然、专业，擅长介绍佛教文化、景点历史、演出活动、门票信息、亲子游攻略和路线推荐。回答不要太长，要像真实导游一样自然。'
            },
            {
              role: 'user',
              content: message
            }
          ],
          temperature: 0.7
        })
      }
    )

    const data = await response.json()

    console.log('豆包返回：', data)

    if (!response.ok) {
      return `接口错误：${data.error?.message || '请求失败'}`
    }

    return (
      data.choices?.[0]?.message?.content ||
      '灵儿暂时没有想到答案'
    )
  } catch (error) {
    console.error('AI请求失败：', error)
    return '网络连接失败'
  }
}