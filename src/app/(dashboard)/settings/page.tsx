import { PageHeader } from '@/shared/components/page-header'

export default function SettingsPage() {
  return (
    <div>
      <PageHeader
        title="Settings"
        description="Manage your account and company settings"
      />
      <div className="grid gap-6 mt-6">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-2">Profile Settings</h3>
          <p className="text-sm text-muted-foreground">
            Profile settings and preferences will be available here.
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-2">Company Settings</h3>
          <p className="text-sm text-muted-foreground">
            Company configuration options will be available here.
          </p>
        </div>
      </div>
    </div>
  )
}
