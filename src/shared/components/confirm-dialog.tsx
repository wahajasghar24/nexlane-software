'use client'

import * as AlertDialog from '@radix-ui/react-alert-dialog'
import { cn } from '@/core/utils/cn'
import { AlertTriangle, Info, Trash2 } from 'lucide-react'

export type ConfirmVariant = 'destructive' | 'warning' | 'info'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  title: string
  message: string
  variant?: ConfirmVariant
  confirmText?: string
  cancelText?: string
  loading?: boolean
}

const variantStyles: Record<ConfirmVariant, {
  icon: React.ElementType
  iconColor: string
  confirmButton: string
  dialogBorder: string
}> = {
  destructive: {
    icon: Trash2,
    iconColor: 'text-destructive',
    confirmButton: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    dialogBorder: 'border-destructive/20',
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-amber-500',
    confirmButton: 'bg-amber-500 text-white hover:bg-amber-600',
    dialogBorder: 'border-amber-200',
  },
  info: {
    icon: Info,
    iconColor: 'text-primary',
    confirmButton: 'bg-primary text-primary-foreground hover:bg-primary/90',
    dialogBorder: 'border-primary/20',
  },
}

export function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  message,
  variant = 'destructive',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  loading = false,
}: ConfirmDialogProps) {
  const styles = variantStyles[variant]
  const Icon = styles.icon

  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <AlertDialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
            styles.dialogBorder,
          )}
        >
          <div className="flex items-start gap-4">
            <div
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                variant === 'destructive' && 'bg-destructive/10',
                variant === 'warning' && 'bg-amber-100',
                variant === 'info' && 'bg-primary/10',
              )}
            >
              <Icon className={cn('h-5 w-5', styles.iconColor)} />
            </div>
            <div className="flex-1 min-w-0">
              <AlertDialog.Title className="text-base font-semibold">
                {title}
              </AlertDialog.Title>
              <AlertDialog.Description className="mt-1 text-sm text-muted-foreground">
                {message}
              </AlertDialog.Description>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <AlertDialog.Cancel asChild>
              <button
                type="button"
                disabled={loading}
                className="rounded-md border bg-background px-4 py-2 text-sm font-medium hover:bg-accent disabled:opacity-50"
              >
                {cancelText}
              </button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <button
                type="button"
                disabled={loading}
                onClick={onConfirm}
                className={cn(
                  'rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50 inline-flex items-center gap-1.5',
                  styles.confirmButton,
                )}
              >
                {loading && (
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                )}
                {confirmText}
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}
