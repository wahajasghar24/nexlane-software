import { createAdminClient } from '@/core/supabase/admin'
import { createClient } from '@/core/supabase/server'
import { DatabaseError } from '@/core/errors/database-error'

export const fileService = {
  async upload(
    companyId: string,
    uploadedBy: string,
    file: { name: string; buffer: ArrayBuffer; type: string },
    entityType?: string,
    entityId?: string
  ) {
    const supabase = createAdminClient()
    const bucket = entityType || 'general'
    const fileName = `${Date.now()}-${file.name}`

    const storage = supabase.storage
    const { data: storageData, error: storageError } = await storage
      .from(bucket)
      .upload(fileName, new Blob([file.buffer]), { contentType: file.type })

    if (storageError) throw new Error(storageError.message)

    const { data, error } = await supabase
      .from('files')
      .insert({
        company_id: companyId,
        name: fileName,
        original_name: file.name,
        mime_type: file.type,
        size_bytes: file.buffer.byteLength,
        storage_path: storageData?.path || fileName,
        bucket,
        entity_type: entityType,
        entity_id: entityId,
        uploaded_by: uploadedBy,
      })
      .select()
      .single()

    if (error) throw new DatabaseError(error)
    return data
  },

  async getSignedUrl(id: string, companyId: string) {
    const supabaseServer = await createClient()
    const { data: file, error } = await supabaseServer
      .from('files')
      .select('*')
      .eq('id', id)
      .eq('company_id', companyId)
      .single()

    if (error || !file) throw new DatabaseError(error || { message: 'File not found' })

    const { data: signedUrl } = await supabaseServer.storage
      .from(file.bucket)
      .createSignedUrl(file.storage_path, 3600) as { data: { signedUrl: string } | null }

    return { file, signedUrl: signedUrl?.signedUrl }
  },

  async findByEntity(companyId: string, entityType: string, entityId: string) {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .eq('company_id', companyId)
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .is('deleted_at', null)
    if (error) throw new DatabaseError(error)
    return data
  },

  async softDelete(id: string, companyId: string, deletedBy: string) {
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('files')
      .update({ deleted_at: new Date().toISOString(), deleted_by: deletedBy })
      .eq('id', id)
      .eq('company_id', companyId)
    if (error) throw new DatabaseError(error)
  },
}
