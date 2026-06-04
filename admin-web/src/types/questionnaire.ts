/** 与 C 端 service.ts、server seed questionnaires 对齐 */
export type QuestionType = 'single' | 'multi' | 'text' | 'score'

export type QuestionOption = {
  id: string
  label: string
}

export type QuestionnaireQuestion = {
  id: number
  type: QuestionType
  title: string
  required: boolean
  options?: QuestionOption[]
}

export type Questionnaire = {
  id?: number
  title: string
  desc: string
  rewardHint: string
  deadline: string
  active: boolean
  questions: QuestionnaireQuestion[]
}

export function emptyQuestionnaire(): Questionnaire {
  return {
    title: '新问卷',
    desc: '',
    rewardHint: '',
    deadline: '2026-12-31 23:59:59',
    active: true,
    questions: [],
  }
}

export function nextQuestionId(questions: QuestionnaireQuestion[]) {
  return (questions.length ? Math.max(...questions.map((q) => q.id)) : 0) + 1
}

export function newQuestion(questions: QuestionnaireQuestion[], type: QuestionType = 'score'): QuestionnaireQuestion {
  const q: QuestionnaireQuestion = {
    id: nextQuestionId(questions),
    type,
    title: '',
    required: true,
  }
  if (type === 'single' || type === 'multi') {
    q.options = [
      { id: 'a', label: '选项 A' },
      { id: 'b', label: '选项 B' },
    ]
  }
  return q
}

export function newOptionId(options: QuestionOption[]) {
  const used = new Set(options.map((o) => o.id))
  for (let i = 0; i < 26; i++) {
    const id = String.fromCharCode(97 + i)
    if (!used.has(id)) return id
  }
  return `opt_${Date.now()}`
}

export function cloneQuestionnaire(raw: Record<string, unknown>): Questionnaire {
  const questions = Array.isArray(raw.questions)
    ? (raw.questions as QuestionnaireQuestion[]).map((q) => ({
        id: Number(q.id),
        type: q.type as QuestionType,
        title: String(q.title ?? ''),
        required: q.required !== false,
        options: Array.isArray(q.options)
          ? q.options.map((o) => ({
              id: String((o as QuestionOption).id),
              label: String((o as QuestionOption).label ?? ''),
            }))
          : undefined,
      }))
    : []
  return {
    id: raw.id != null ? Number(raw.id) : undefined,
    title: String(raw.title ?? ''),
    desc: String(raw.desc ?? ''),
    rewardHint: String(raw.rewardHint ?? ''),
    deadline: String(raw.deadline ?? ''),
    active: raw.active !== false,
    questions,
  }
}

export function sanitizeQuestionnaire(form: Questionnaire): Questionnaire {
  const questions = form.questions.map((q) => {
    const row: QuestionnaireQuestion = {
      id: q.id,
      type: q.type,
      title: q.title.trim() || '未命名题目',
      required: !!q.required,
    }
    if (q.type === 'single' || q.type === 'multi') {
      row.options = (q.options || [])
        .filter((o) => o.label.trim())
        .map((o) => ({ id: o.id || newOptionId([]), label: o.label.trim() }))
    }
    return row
  })
  return {
    ...form,
    title: form.title.trim() || '未命名问卷',
    questions,
  }
}
