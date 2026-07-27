'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { PageHeader } from '@/shared/components/page-header'
import { EmptyState } from '@/shared/components/empty-state'
import Link from 'next/link'

export default function TeamDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [team, setTeam] = useState<any>(null)
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/teams/${id}`)
      .then(r => r.json())
      .then(d => {
        const data = d.data || d
        setTeam(data)
        setMembers(data.members || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Remove this member from the team?')) return
    const res = await fetch(`/api/teams/${id}/members/${memberId}`, { method: 'DELETE' })
    if (res.ok) {
      setMembers(prev => prev.filter(m => m.id !== memberId))
    }
  }

  const getDisplayName = (m: any) => m.profile?.full_name || `${m.first_name || ''} ${m.last_name || ''}`.trim() || m.name || 'Unnamed'

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 w-48 bg-muted rounded" /><div className="h-64 bg-muted rounded" /></div>

  if (!team) return <EmptyState title="Team not found" />

  return (
    <div>
      <PageHeader
        title={team.name}
        description={team.description || ''}
      />

      <div className="grid gap-6 md:grid-cols-4 mb-6">
        <div className="rounded-lg border bg-card p-4 text-center">
          <p className="text-2xl font-bold">{members.length}</p>
          <p className="text-xs text-muted-foreground">Members</p>
        </div>
        {team.lead && (
          <div className="rounded-lg border bg-card p-4">
            <p className="text-xs text-muted-foreground">Team Lead</p>
            <p className="font-medium mt-1">{getDisplayName(team.lead)}</p>
          </div>
        )}
      </div>

      <div className="rounded-lg border bg-card">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Team Members</h3>
        </div>
        {members.length === 0 ? (
          <EmptyState title="No members" />
        ) : (
          <div className="divide-y">
            {members.map((member: any) => (
              <div key={member.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                    {getDisplayName(member).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <Link href={`/employees/${member.id}`} className="font-medium text-sm hover:text-primary">
                      {getDisplayName(member)}
                    </Link>
                    <p className="text-xs text-muted-foreground">{member.position || member.designation?.name || ''}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveMember(member.id)}
                  className="text-xs text-destructive hover:text-destructive/80"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
