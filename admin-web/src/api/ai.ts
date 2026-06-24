const API_KEY = '96bc9c08-3b6f-410f-9d01-b30a6fe8eb98'

export async function askAI(message: string): Promise<string> {
  try {
    const response = await fetch(
      'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: 'doubao-seed-2-0-lite-260428',
          messages: [
            {
              role: 'system',
              content:
                '你是灵山胜境景区的运营数据分析助手。你擅长分析景区运营数据，给出简洁、实用的运营建议。回答不要太长，重点突出。',
            },
            {
              role: 'user',
              content: message,
            },
          ],
          temperature: 0.7,
        }),
      },
    )

    const data = await response.json()

    if (!response.ok) {
      return `接口错误：${data.error?.message || '请求失败'}`
    }

    return data.choices?.[0]?.message?.content || '暂时无法生成分析'
  } catch (error) {
    console.error('AI请求失败：', error)
    return '网络连接失败'
  }
}
