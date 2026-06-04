import type { HomeConfig } from '@/types/homeConfig'
import type { AdminListQuery, AdminPageResult } from '@/types/adminList'
import { apiDelete, apiGet, apiPost, apiPut } from '@/utils/request'

const P = '/api/admin'

export type AdminUser = { id: number; name: string; role: string }

export function login(username: string, password: string) {
  return apiPost<{ token: string; admin: AdminUser }>(`${P}/auth/login`, { username, password })
}

export function fetchOverview() {
  return apiGet<Record<string, number>>(`${P}/statistics/overview`)
}

export function fetchFeedback(params?: AdminListQuery) {
  return apiGet<AdminPageResult<unknown> | unknown[]>(`${P}/feedback`, params as Record<string, unknown>)
}

export function updateFeedbackStatus(id: number, status: string) {
  return apiPut(`${P}/feedback/${id}/status`, { status })
}

export function fetchTickets() {
  return apiGet<unknown[]>(`${P}/support/tickets`)
}

export function updateTicket(id: number, body: { status?: string; adminReply?: string }) {
  return apiPut(`${P}/support/tickets/${id}`, body)
}

export function fetchReviews(params?: AdminListQuery) {
  return apiGet<AdminPageResult<unknown> | unknown[]>(`${P}/reviews`, params as Record<string, unknown>)
}

export function updateReviewStatus(id: number, status: string) {
  return apiPut(`${P}/reviews/${id}/status`, { status })
}

export function fetchFaqs() {
  return apiGet<unknown[]>(`${P}/ai-service/faqs`)
}

export function createFaq(body: Record<string, unknown>) {
  return apiPost(`${P}/ai-service/faqs`, body)
}

export function updateFaq(id: number, body: Record<string, unknown>) {
  return apiPut(`${P}/ai-service/faqs/${id}`, body)
}

export function deleteFaq(id: number) {
  return apiDelete(`${P}/ai-service/faqs/${id}`)
}

export function fetchQuestionnaires() {
  return apiGet<unknown[]>(`${P}/questionnaires`)
}

export function createQuestionnaire(body: Record<string, unknown>) {
  return apiPost(`${P}/questionnaires`, body)
}

export function updateQuestionnaire(id: number, body: Record<string, unknown>) {
  return apiPut(`${P}/questionnaires/${id}`, body)
}

export function fetchQuestionnaireSubmissions(id: number) {
  return apiGet<{
    questionnaireId: number
    title: string
    list: Record<string, unknown>[]
    total: number
  }>(`${P}/questionnaires/${id}/submissions`)
}

export function fetchServiceConfig() {
  return apiGet<Record<string, string>>(`${P}/service/config`)
}

export function updateServiceConfig(body: Record<string, string>) {
  return apiPut(`${P}/service/config`, body)
}

export function fetchHomeConfig() {
  return apiGet<HomeConfig>(`${P}/home/config`)
}

export function updateHomeConfig(body: HomeConfig) {
  return apiPut<HomeConfig>(`${P}/home/config`, body)
}

export function fetchDiscoverPosts(params?: AdminListQuery) {
  return apiGet<AdminPageResult<unknown> | unknown[]>(`${P}/discover/posts`, params as Record<string, unknown>)
}

export function createDiscoverPost(body: Record<string, unknown>) {
  return apiPost(`${P}/discover/posts`, body)
}

export function updateDiscoverPost(id: number, body: Record<string, unknown>) {
  return apiPut(`${P}/discover/posts/${id}`, body)
}

export function updateDiscoverStatus(id: number, status: string) {
  return apiPut(`${P}/discover/posts/${id}/status`, { status })
}

export function deleteDiscoverPost(id: number) {
  return apiDelete(`${P}/discover/posts/${id}`)
}
