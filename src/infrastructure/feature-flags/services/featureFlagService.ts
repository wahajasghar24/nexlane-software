import { createAdminClient } from '@/core/supabase/admin'
import { DatabaseError } from '@/core/errors/database-error'

export const featureFlagService = {
  async getEnabled(companyId: string): Promise<string[]> {
    const supabase = createAdminClient()

    const { data: globalFlags } = await supabase
      .from('feature_flags')
      .select('code, is_enabled')
      .eq('is_enabled', true)

    const { data: companyOverrides } = await supabase
      .from('company_feature_flags')
      .select('feature_flag_id, is_enabled')
      .eq('company_id', companyId)

    const overrideMap = new Map<string, boolean>()
    if (companyOverrides) {
      const { data: flags } = await supabase
        .from('feature_flags')
        .select('id, code')
        .in('id', companyOverrides.map(co => co.feature_flag_id))

      if (flags) {
        for (const co of companyOverrides) {
          const flag = flags.find(f => f.id === co.feature_flag_id)
          if (flag) overrideMap.set(flag.code, co.is_enabled)
        }
      }
    }

    return (globalFlags || [])
      .filter(f => overrideMap.get(f.code) ?? f.is_enabled)
      .map(f => f.code)
  },

  async setCompanyOverride(companyId: string, flagCode: string, isEnabled: boolean): Promise<void> {
    const supabase = createAdminClient()

    const { data: flag } = await supabase
      .from('feature_flags')
      .select('id')
      .eq('code', flagCode)
      .single()

    if (!flag) throw new Error(`Feature flag "${flagCode}" not found`)

    const { error } = await supabase
      .from('company_feature_flags')
      .upsert({
        company_id: companyId,
        feature_flag_id: flag.id,
        is_enabled: isEnabled,
      }, { onConflict: 'company_id,feature_flag_id' })

    if (error) throw new DatabaseError(error)
  },
}
