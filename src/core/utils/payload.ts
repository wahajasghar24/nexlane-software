/**
 * Clean form payloads before sending to API routes.
 *
 * HTML forms submit empty string for untouched optional fields (`<option value="">`,
 * empty text inputs). Zod schemas reject `""` for uuid/email/enum fields (e.g.
 * "Invalid uuid"), which made "add" actions silently fail. Stripping empty/null
 * values lets optional fields be omitted so the API defaults apply.
 */
export function cleanFormPayload<T extends Record<string, unknown>>(form: T): Partial<T> {
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(form)) {
    if (value === '' || value === null || value === undefined) continue
    out[key] = value
  }
  return out as Partial<T>
}
