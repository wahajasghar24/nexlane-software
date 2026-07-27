import { createClient } from '@/core/supabase/server'
import { DatabaseError } from '@/core/errors/database-error'

interface SearchResult {
  entityType: string
  entityId: string
  title: string
  metadata: Record<string, unknown>
}

export const searchService = {
  async search(companyId: string, query: string): Promise<SearchResult[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('search_index')
      .select('entity_type, entity_id, title, metadata')
      .eq('company_id', companyId)
      .textSearch('content', query, { config: 'english' })
      .limit(20)

    if (error) throw new DatabaseError(error)
    return (data || []).map((d: { entity_type: string; entity_id: string; title: string | null; metadata: unknown }) => ({
      entityType: d.entity_type,
      entityId: d.entity_id,
      title: d.title || '',
      metadata: d.metadata as Record<string, unknown> || {},
    }))
  },

  async index(companyId: string, entityType: string, entityId: string, title: string, content: string, metadata?: Record<string, unknown>) {
    const supabase = await createClient()

    const { error } = await supabase.from('search_index').upsert(
      {
        company_id: companyId,
        entity_type: entityType,
        entity_id: entityId,
        title,
        content: content,
        metadata,
      },
      { onConflict: 'company_id,entity_type,entity_id' }
    )

    if (error) throw new DatabaseError(error)
  },

  async remove(companyId: string, entityType: string, entityId: string) {
    const supabase = await createClient()
    const { error } = await supabase
      .from('search_index')
      .delete()
      .eq('company_id', companyId)
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
    if (error) throw new DatabaseError(error)
  },
}
