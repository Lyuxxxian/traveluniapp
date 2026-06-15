import { AI_PROXY_PATHS, API_PATHS } from '../config/api'
import { isRemoteApiEnabled } from '../utils/remoteApi'
import { http } from '../utils/request'
import { getToken } from '../utils/auth'
import {
  MOCK_FAQS,
  MOCK_QUESTIONNAIRE_DETAILS,
  MOCK_QUESTIONNAIRES,
  MOCK_SEED_REVIEWS,
  MOCK_SEED_TICKETS,
  MOCK_SERVICE_CONFIG,
} from './serviceData'

/**
 * 服务层 API（契约见 API接口文档v4 第 13 章）
 *
 * 开发环境默认走远程 API；可用 VITE_SERVICE_USE_REMOTE_API=false 强制 mock
 * 模拟失败：VITE_SERVICE_SIMULATE_API_ERROR=true
 * 禁止引用 src/api/ai.ts 的 askAI
 */
const USE_REMOTE_SERVICE_API = isRemoteApiEnabled(import.meta.env.VITE_SERVICE_USE_REMOTE_API)
const SIMULATE_SERVICE_API_ERROR = import.meta.env.VITE_SERVICE_SIMULATE_API_ERROR === 'true'

const SERVICE_READ_OPTS = { auth: false, showErrorToast: false } as const
const SERVICE_WRITE_OPTS = { showErrorToast: true } as const

// --- 类型（与文档 13 章、16.8–16.12 对齐）---

export type ReviewTargetType = 'spot' | 'order' | 'product' | 'discoverPost'
export type ReviewStatus = 'pending' | 'published' | 'rejected'
export type FeedbackType = 'suggestion' | 'complaint' | 'facility' | 'other'
export type QuestionType = 'single' | 'multi' | 'text' | 'score'
export type SupportTicketCategory =
  | 'ticket_refund'
  | 'order_issue'
  | 'facility'
  | 'route_guide'
  | 'other'
export type SupportTicketStatus = 'open' | 'processing' | 'closed'
export type FaqType = 'normal' | 'human'

export type FaqItem = {
  id: number
  question: string
  answer?: string
  category?: string
  type?: FaqType
  sort?: number
}

export type ServiceConfig = {
  servicePhone: string
  serviceHours: string
  servicePhoneRemark?: string
}

export type ReviewItem = {
  id: number
  targetType: ReviewTargetType
  targetId: number
  targetTitle: string
  rating: number
  content: string
  images?: string[]
  createdAt: string
  status?: ReviewStatus
}

export type PaginatedResult<T> = {
  list: T[]
  page: number
  pageSize: number
  total: number
  hasMore: boolean
}

export type SubmitReviewPayload = {
  targetType: ReviewTargetType
  targetId: number
  rating: number
  content: string
  images?: string[]
  orderId?: number
}

export type SubmitReviewResult = {
  id: number
  createdAt: string
}

export type SubmitFeedbackPayload = {
  type: FeedbackType
  content: string
  images?: string[]
  contact?: string
  relatedPointId?: number
  relatedOrderId?: number
}

export type SubmitFeedbackResult = {
  id: number
  createdAt: string
}

export type QuestionnaireSummary = {
  id: number
  title: string
  desc?: string
  rewardHint?: string
  deadline?: string
  submitted?: boolean
}

export type QuestionOption = {
  id: string
  label: string
}

export type QuestionnaireQuestion = {
  id: number
  type: QuestionType
  title: string
  required?: boolean
  options?: QuestionOption[]
}

export type QuestionnaireDetail = QuestionnaireSummary & {
  questions: QuestionnaireQuestion[]
}

export type QuestionnaireAnswer = {
  questionId: number
  value: string | string[] | number
}

export type SubmitQuestionnaireResult = {
  submissionId: number
  rewardHint?: string
  createdAt: string
}

export type SubmitSupportTicketPayload = {
  category: SupportTicketCategory
  content: string
  contact: string
  images?: string[]
  relatedOrderId?: number
  relatedPointId?: number
}

export type SubmitSupportTicketResult = {
  id: number
  ticketNo: string
  status: SupportTicketStatus
  createdAt: string
}

export type SupportTicketItem = {
  id: number
  ticketNo: string
  category: SupportTicketCategory
  content: string
  status: SupportTicketStatus
  adminReply?: string
  createdAt: string
  updatedAt?: string
}

export type UserReviewsQuery = {
  page?: number
  pageSize?: number
  targetType?: ReviewTargetType
}

export type ReviewsByTargetQuery = {
  targetType: ReviewTargetType
  targetId: number
  page?: number
  pageSize?: number
}

export type UserTicketsQuery = {
  page?: number
  pageSize?: number
}

// --- 内存 mock 存储（会话内追加）---

let mockReviewSeq = 90100
let mockFeedbackSeq = 70001
let mockTicketSeq = 80010
let mockSubmissionSeq = 50001

const mockReviewsStore: ReviewItem[] = [...MOCK_SEED_REVIEWS]
const mockPublishedReviews: ReviewItem[] = [...MOCK_SEED_REVIEWS]
const mockTicketsStore: SupportTicketItem[] = [...MOCK_SEED_TICKETS]
const mockSubmittedQuestionnaireIds = new Set<number>()

function nowText() {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

function simulateApiError(): Promise<never> | null {
  if (SIMULATE_SERVICE_API_ERROR) {
    return Promise.reject(new Error('SERVICE_API_SIMULATED_ERROR'))
  }
  return null
}

function paginate<T>(list: T[], page = 1, pageSize = 10): PaginatedResult<T> {
  const safePage = Math.max(1, page)
  const safeSize = Math.min(50, Math.max(1, pageSize))
  const start = (safePage - 1) * safeSize
  const slice = list.slice(start, start + safeSize)
  const total = list.length
  return {
    list: slice,
    page: safePage,
    pageSize: safeSize,
    total,
    hasMore: start + slice.length < total,
  }
}

async function fetchRemoteOrFallback<T>(
  remoteFetcher: () => Promise<T>,
  fallback: () => T,
  isEmpty: (data: T) => boolean = () => false,
): Promise<T> {
  const simulated = simulateApiError()
  if (simulated) return simulated

  if (!USE_REMOTE_SERVICE_API) {
    return Promise.resolve(fallback())
  }

  try {
    const data = await remoteFetcher()
    if (isEmpty(data)) {
      return fallback()
    }
    return data
  } catch {
    return fallback()
  }
}

async function postRemoteOrFallback<T>(
  remoteFetcher: () => Promise<T>,
  fallback: () => T,
): Promise<T> {
  const simulated = simulateApiError()
  if (simulated) return simulated

  if (!USE_REMOTE_SERVICE_API) {
    return Promise.resolve(fallback())
  }

  try {
    return await remoteFetcher()
  } catch (error) {
    if (import.meta.env.DEV) {
      return fallback()
    }
    throw error
  }
}

function normalizeFaqList(data: unknown): FaqItem[] {
  if (!Array.isArray(data)) return []
  return data.filter((item) => item && typeof item === 'object' && (item as FaqItem).question) as FaqItem[]
}

function resolveTargetTitle(targetType: ReviewTargetType, targetId: number) {
  const map: Record<string, string> = {
    '101': '灵山大佛',
    '103': '九龙灌浴',
    '104': '灵山梵宫',
  }
  if (targetType === 'spot' && map[String(targetId)]) {
    return map[String(targetId)]
  }
  return `${targetType} #${targetId}`
}

function mockSubmitReview(payload: SubmitReviewPayload): SubmitReviewResult {
  const duplicate = mockReviewsStore.find(
    (item) => item.targetType === payload.targetType && item.targetId === payload.targetId,
  )
  if (duplicate) {
    throw new Error('您已评价过该对象')
  }

  const createdAt = nowText()
  const id = ++mockReviewSeq
  const row: ReviewItem = {
    id,
    targetType: payload.targetType,
    targetId: payload.targetId,
    targetTitle: resolveTargetTitle(payload.targetType, payload.targetId),
    rating: payload.rating,
    content: payload.content,
    images: payload.images || [],
    createdAt,
    status: 'published',
  }
  mockReviewsStore.unshift(row)
  mockPublishedReviews.unshift(row)
  return { id, createdAt }
}

function mockSubmitFeedback(payload: SubmitFeedbackPayload): SubmitFeedbackResult {
  const id = ++mockFeedbackSeq
  return { id, createdAt: nowText() }
}

function mockSubmitQuestionnaire(
  questionnaireId: number,
  _answers: QuestionnaireAnswer[],
): SubmitQuestionnaireResult {
  if (mockSubmittedQuestionnaireIds.has(questionnaireId)) {
    throw new Error('您已填写过该问卷')
  }
  mockSubmittedQuestionnaireIds.add(questionnaireId)
  const detail = MOCK_QUESTIONNAIRE_DETAILS[questionnaireId]
  return {
    submissionId: ++mockSubmissionSeq,
    rewardHint: detail?.desc ? MOCK_QUESTIONNAIRES.find((q) => q.id === questionnaireId)?.rewardHint : undefined,
    createdAt: nowText(),
  }
}

function mockSubmitTicket(payload: SubmitSupportTicketPayload): SubmitSupportTicketResult {
  const id = ++mockTicketSeq
  const ticketNo = `TK${Date.now()}`
  const createdAt = nowText()
  mockTicketsStore.unshift({
    id,
    ticketNo,
    category: payload.category,
    content: payload.content.slice(0, 80),
    status: 'open',
    createdAt,
    updatedAt: createdAt,
  })
  return { id, ticketNo, status: 'open', createdAt }
}

// --- 导出 API ---

export async function fetchFaqs(): Promise<FaqItem[]> {
  return fetchRemoteOrFallback(
    () => http.get<FaqItem[]>(AI_PROXY_PATHS.faqs, undefined, SERVICE_READ_OPTS).then(normalizeFaqList),
    () => [...MOCK_FAQS].sort((a, b) => (a.sort || 0) - (b.sort || 0)),
    (data) => !data.length,
  )
}

export async function fetchServiceConfig(): Promise<ServiceConfig> {
  return fetchRemoteOrFallback(
    () => http.get<ServiceConfig>(API_PATHS.service.config, undefined, SERVICE_READ_OPTS),
    () => ({ ...MOCK_SERVICE_CONFIG }),
    (data) => !data?.servicePhone,
  )
}

export async function fetchReviewsByTarget(
  params: ReviewsByTargetQuery,
): Promise<PaginatedResult<ReviewItem>> {
  return fetchRemoteOrFallback(
    () =>
      http
        .get<PaginatedResult<ReviewItem>>(API_PATHS.service.reviews, params, SERVICE_READ_OPTS)
        .then((data) => data || paginate([], params.page, params.pageSize)),
    () => {
      const filtered = mockPublishedReviews.filter(
        (item) =>
          item.targetType === params.targetType
          && item.targetId === params.targetId
          && item.status === 'published',
      )
      return paginate(filtered, params.page, params.pageSize)
    },
  )
}

export async function fetchUserReviews(
  params: UserReviewsQuery = {},
): Promise<PaginatedResult<ReviewItem>> {
  return fetchRemoteOrFallback(
    () =>
      http.get<PaginatedResult<ReviewItem>>(API_PATHS.service.userReviews, params, {
        showErrorToast: false,
      }),
    () => {
      let list = [...mockReviewsStore]
      if (params.targetType) {
        list = list.filter((item) => item.targetType === params.targetType)
      }
      return paginate(list, params.page, params.pageSize)
    },
  )
}

export async function submitReview(payload: SubmitReviewPayload): Promise<SubmitReviewResult> {
  return postRemoteOrFallback(
    () => http.post<SubmitReviewResult>(API_PATHS.service.reviews, payload, SERVICE_WRITE_OPTS),
    () => mockSubmitReview(payload),
  )
}

export async function submitFeedback(payload: SubmitFeedbackPayload): Promise<SubmitFeedbackResult> {
  return postRemoteOrFallback(
    () => http.post<SubmitFeedbackResult>(API_PATHS.service.feedback, payload, SERVICE_WRITE_OPTS),
    () => mockSubmitFeedback(payload),
  )
}

export async function fetchQuestionnaires(): Promise<QuestionnaireSummary[]> {
  const listOpts = {
    auth: !!getToken(),
    showErrorToast: false,
  } as const
  return fetchRemoteOrFallback(
    () => http.get<QuestionnaireSummary[]>(API_PATHS.service.questionnaires, undefined, listOpts),
    () =>
      MOCK_QUESTIONNAIRES.map((item) => ({
        ...item,
        submitted: mockSubmittedQuestionnaireIds.has(item.id),
      })),
    (data) => !data.length,
  )
}

export async function fetchQuestionnaireDetail(id: number): Promise<QuestionnaireDetail | null> {
  const simulated = simulateApiError()
  if (simulated) return simulated

  if (USE_REMOTE_SERVICE_API) {
    try {
      const detail = await http.get<QuestionnaireDetail>(
        `${API_PATHS.service.questionnaires}/${id}`,
        undefined,
        SERVICE_READ_OPTS,
      )
      if (detail?.questions?.length) {
        return detail
      }
    } catch {
      // fallback
    }
  }

  return Promise.resolve(MOCK_QUESTIONNAIRE_DETAILS[id] ? { ...MOCK_QUESTIONNAIRE_DETAILS[id] } : null)
}

export async function submitQuestionnaire(
  id: number,
  answers: QuestionnaireAnswer[],
): Promise<SubmitQuestionnaireResult> {
  return postRemoteOrFallback(
    () =>
      http.post<SubmitQuestionnaireResult>(
        `${API_PATHS.service.questionnaires}/${id}/submit`,
        { answers },
        SERVICE_WRITE_OPTS,
      ),
    () => mockSubmitQuestionnaire(id, answers),
  )
}

export async function submitSupportTicket(
  payload: SubmitSupportTicketPayload,
): Promise<SubmitSupportTicketResult> {
  return postRemoteOrFallback(
    () => http.post<SubmitSupportTicketResult>(API_PATHS.service.supportTickets, payload, SERVICE_WRITE_OPTS),
    () => mockSubmitTicket(payload),
  )
}

export async function fetchUserSupportTickets(
  params: UserTicketsQuery = {},
): Promise<PaginatedResult<SupportTicketItem>> {
  return fetchRemoteOrFallback(
    () =>
      http.get<PaginatedResult<SupportTicketItem>>(API_PATHS.service.userSupportTickets, params, {
        showErrorToast: false,
      }),
    () => paginate([...mockTicketsStore], params.page, params.pageSize),
  )
}

/** 是否已开启远程服务层 API */
export function isServiceRemoteApiEnabled() {
  return USE_REMOTE_SERVICE_API
}

/** 仅测试/重置 mock 会话数据 */
export function resetServiceMockSession() {
  mockReviewSeq = 90100
  mockFeedbackSeq = 70001
  mockTicketSeq = 80010
  mockSubmissionSeq = 50001
  mockReviewsStore.length = 0
  mockReviewsStore.push(...MOCK_SEED_REVIEWS)
  mockPublishedReviews.length = 0
  mockPublishedReviews.push(...MOCK_SEED_REVIEWS)
  mockTicketsStore.length = 0
  mockTicketsStore.push(...MOCK_SEED_TICKETS)
  mockSubmittedQuestionnaireIds.clear()
}
