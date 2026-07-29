import { createClient } from '@/core/supabase/server'
import { DatabaseError } from '@/core/errors/database-error'

export const searchService = {
  async globalSearch(companyId: string, query: string) {
    const supabase = await createClient()
    const searchTerm = `%${query}%`
    const results: any[] = []

    // Search accounts
    const { data: accounts } = await supabase
      .from('chart_of_accounts')
      .select('id, name, code, type, description')
      .eq('company_id', companyId)
      .or(`name.ilike.${searchTerm},code.ilike.${searchTerm},description.ilike.${searchTerm}`)
      .limit(5)
    if (accounts) results.push(...accounts.map(a => ({ ...a, _type: 'account' })))

    // Search projects
    const { data: projects } = await supabase
      .from('projects')
      .select('id, name, client_name')
      .eq('company_id', companyId)
      .or(`name.ilike.${searchTerm},client_name.ilike.${searchTerm}`)
      .limit(5)
    if (projects) results.push(...projects.map(p => ({ ...p, _type: 'project' })))

    // Search invoices
    const { data: invoices } = await supabase
      .from('invoices')
      .select('id, invoice_number, total, status')
      .eq('company_id', companyId)
      .or(`invoice_number.ilike.${searchTerm},notes.ilike.${searchTerm}`)
      .limit(5)
    if (invoices) results.push(...invoices.map(i => ({ ...i, name: i.invoice_number, _type: 'invoice' })))

    // Search employees
    const { data: employees } = await supabase
      .from('employees')
      .select('id, first_name, last_name, email')
      .eq('company_id', companyId)
      .or(`first_name.ilike.${searchTerm},last_name.ilike.${searchTerm},email.ilike.${searchTerm}`)
      .limit(5)
    if (employees) results.push(...employees.map(e => ({ ...e, name: `${e.first_name} ${e.last_name}`, _type: 'employee' })))

    return results
  },
}
