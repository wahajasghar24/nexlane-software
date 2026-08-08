import { settingsService } from '@/infrastructure/settings/services/settingsService'
import { createAdminClient } from '@/core/supabase/admin'
import { DatabaseError } from '@/core/errors/database-error'

export interface AutomationRule {
  id: string
  name: string
  entity: string
  trigger: string
  conditions: { field: string; op: 'eq' | 'gt' | 'lt' | 'contains'; value: string }[]
  actions: { type: 'email' | 'webhook' | 'status_change'; config: Record<string, unknown> }[]
  enabled: boolean
}

type StoredRule = Omit<AutomationRule, 'id'>

export async function getRules(companyId: string): Promise<AutomationRule[]> {
  const raw = await settingsService.getCompany(companyId, 'automation_rules')
  if (!raw) return []
  const arr = typeof raw === 'string' ? JSON.parse(raw) : raw
  if (!Array.isArray(arr)) return []
  return arr as AutomationRule[]
}

async function saveRules(companyId: string, rules: AutomationRule[]) {
  await settingsService.setCompany(companyId, 'automation_rules', rules, 'automation')
}

export async function createRule(companyId: string, rule: StoredRule): Promise<AutomationRule> {
  const rules = await getRules(companyId)
  const newRule: AutomationRule = { ...rule, id: crypto.randomUUID() }
  rules.push(newRule)
  await saveRules(companyId, rules)
  return newRule
}

export async function updateRule(
  companyId: string,
  ruleId: string,
  updates: Partial<StoredRule>
): Promise<AutomationRule> {
  const rules = await getRules(companyId)
  const idx = rules.findIndex((r) => r.id === ruleId)
  if (idx === -1) throw new Error('Rule not found')
  rules[idx] = { ...rules[idx], ...updates }
  await saveRules(companyId, rules)
  return rules[idx]
}

export async function deleteRule(companyId: string, ruleId: string): Promise<void> {
  const rules = await getRules(companyId)
  const filtered = rules.filter((r) => r.id !== ruleId)
  if (filtered.length === rules.length) throw new Error('Rule not found')
  await saveRules(companyId, filtered)
}

function matchCondition(
  op: string,
  fieldValue: unknown,
  ruleValue: string
): boolean {
  const fv = String(fieldValue ?? '')
  switch (op) {
    case 'eq': return fv === ruleValue
    case 'gt': return Number(fv) > Number(ruleValue)
    case 'lt': return Number(fv) < Number(ruleValue)
    case 'contains': return fv.toLowerCase().includes(ruleValue.toLowerCase())
    default: return false
  }
}

export async function evaluateRules(
  companyId: string,
  entity: string,
  trigger: string,
  data: Record<string, unknown>
): Promise<void> {
  const rules = await getRules(companyId)
  const matching = rules.filter(
    (r) => r.enabled && r.entity === entity && r.trigger === trigger
  )

  for (const rule of matching) {
    const allMatch = rule.conditions.every((c) => matchCondition(c.op, data[c.field], c.value))
    if (!allMatch) continue

    for (const action of rule.actions) {
      // ponytail: log-only for now, wire up email/webhook/status_change when needed
      if (action.type === 'status_change') {
        const admin = createAdminClient()
        const table = `${entity}s` // ponytail: naive pluralization
        const { error } = await admin
          .from(table)
          .update({ status: action.config.status })
          .eq('id', data.id)
        if (error) console.error(`[automation] status_change failed for ${entity}:${data.id}`, error)
      } else {
        console.log(`[automation] rule=${rule.name} action=${action.type}`, action.config)
      }
    }
  }
}
