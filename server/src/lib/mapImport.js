/**
 * 批量导入 mapPoints 校验与规范化（脚本 / 文档共用逻辑）
 */
import {
  buildMapPointBase,
  validateMapPointBase,
  pickMapDetailFromBody,
} from './mapStore.js'

function splitList(value) {
  if (Array.isArray(value)) return value
  if (value === undefined || value === null || value === '') return undefined
  return String(value)
    .split(/[;；,，|]/)
    .map((s) => s.trim())
    .filter(Boolean)
}

function splitNumberList(value) {
  const list = splitList(value)
  if (!list) return undefined
  return list.map((s) => Number(s)).filter((n) => Number.isFinite(n))
}

export function normalizeImportRow(raw = {}) {
  const row = { ...raw }
  delete row.comment
  row.tags = splitList(row.tags)
  row.serviceTags = splitList(row.serviceTags)
  row.images = splitList(row.images)
  row.relatedShowIds = splitNumberList(row.relatedShowIds)
  row.relatedProductIds = splitNumberList(row.relatedProductIds)
  if (row.id !== undefined && row.id !== null && row.id !== '') {
    row.id = Number(row.id)
  } else {
    delete row.id
  }
  if (row.latitude !== undefined) row.latitude = Number(row.latitude)
  if (row.longitude !== undefined) row.longitude = Number(row.longitude)
  return row
}

export function parseImportPayload(data) {
  if (Array.isArray(data)) return data
  if (data && Array.isArray(data.points)) return data.points
  throw new Error('JSON 须为数组，或 { "points": [ ... ] } 对象')
}

export function planMapPointImport(store, rawRows, options = {}) {
  const { update = false, assignId } = options
  const existingIds = new Set((store.mapPoints || []).map((p) => p.id))
  const usedIds = new Set(existingIds)
  const errors = []
  const planned = []

  rawRows.forEach((raw, index) => {
    const row = normalizeImportRow(raw)
    const base = buildMapPointBase(row)
    const err = validateMapPointBase(base, store)
    if (err) {
      errors.push(`第 ${index + 1} 行: ${err}`)
      return
    }

    let id = row.id
    if (id !== undefined) {
      if (!Number.isFinite(id)) {
        errors.push(`第 ${index + 1} 行: id 无效`)
        return
      }
      if (usedIds.has(id) && !(update && existingIds.has(id))) {
        errors.push(`第 ${index + 1} 行: id ${id} 已存在（省略 id 可自动分配）`)
        return
      }
      usedIds.add(id)
    } else if (typeof assignId === 'function') {
      id = assignId()
      if (usedIds.has(id)) {
        errors.push(`第 ${index + 1} 行: 自动分配 id ${id} 冲突`)
        return
      }
      usedIds.add(id)
    } else {
      errors.push(`第 ${index + 1} 行: 缺少 id 且未启用自动分配`)
      return
    }

    const point = {
      id,
      ...base,
      latitude: Number(base.latitude),
      longitude: Number(base.longitude),
      iconKey: base.category,
    }
    const detail = pickMapDetailFromBody(row)
    planned.push({
      index: index + 1,
      point,
      detail,
      mode: existingIds.has(id) && update ? 'update' : 'create',
    })
  })

  return { planned, errors, createCount: planned.filter((p) => p.mode === 'create').length }
}
