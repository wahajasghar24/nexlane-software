import { createAdminClient } from '@/core/supabase/admin'

export const observability = {
  async logApp(level: string, message: string, metadata?: Record<string, unknown>, source?: string) {
    try {
      const supabase = createAdminClient()
      await supabase.from('app_logs').insert({
        level, message, metadata, source,
      })
    } catch {} // Silent — logging should never break the app
  },

  async logError(
    errorCode: string,
    message: string,
    context?: Record<string, unknown>,
    severity: string = 'error'
  ) {
    try {
      const supabase = createAdminClient()
      await supabase.from('error_logs').insert({
        error_code: errorCode,
        message,
        context,
        severity,
      })
    } catch {}
  },

  async recordApiMetric(method: string, path: string, statusCode: number, durationMs: number, userId?: string, ipAddress?: string) {
    try {
      const supabase = createAdminClient()
      await supabase.from('api_metrics').insert({
        method, path, status_code: statusCode, duration_ms: durationMs, user_id: userId, ip_address: ipAddress,
      })
    } catch {}
  },

  async recordPerformance(name: string, value: number, unit: string, tags?: Record<string, string>) {
    try {
      const supabase = createAdminClient()
      await supabase.from('performance_metrics').insert({
        metric_name: name, value, unit, tags,
      })
    } catch {}
  },
}
