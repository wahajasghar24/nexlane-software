'use client'

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import { ConfirmDialog, type ConfirmVariant } from '@/shared/components/confirm-dialog'

export interface ConfirmOptions {
  title?: string
  message: string
  variant?: ConfirmVariant
  confirmText?: string
  cancelText?: string
}

interface ConfirmState {
  open: boolean
  options: Required<Omit<ConfirmOptions, 'title'>> & { title: string }
  resolve: (value: boolean) => void
}

const defaultOptions = {
  title: 'Are you sure?',
  variant: 'destructive' as ConfirmVariant,
  confirmText: 'Confirm',
  cancelText: 'Cancel',
}

interface ConfirmContextValue {
  confirm: (options: string | ConfirmOptions) => Promise<boolean>
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null)

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ConfirmState | null>(null)

  const confirm = useCallback((options: string | ConfirmOptions): Promise<boolean> => {
    const opts: ConfirmOptions = typeof options === 'string' ? { message: options } : options
    return new Promise((resolve) => {
      setState({
        open: true,
        options: {
          ...defaultOptions,
          ...opts,
          title: opts.title ?? defaultOptions.title,
        },
        resolve,
      })
    })
  }, [])

  const handleConfirm = useCallback(() => {
    setState((prev) => {
      prev?.resolve(true)
      return null
    })
  }, [])

  const handleCancel = useCallback(() => {
    setState((prev) => {
      prev?.resolve(false)
      return null
    })
  }, [])

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {state && (
        <ConfirmDialog
          open={state.open}
          onOpenChange={(open) => {
            if (!open) handleCancel()
          }}
          onConfirm={handleConfirm}
          title={state.options.title}
          message={state.options.message}
          variant={state.options.variant}
          confirmText={state.options.confirmText}
          cancelText={state.options.cancelText}
        />
      )}
    </ConfirmContext.Provider>
  )
}

/**
 * Returns a confirm function that works like window.confirm() but renders a styled dialog.
 *
 * Simple usage (destructive delete confirmation):
 *   const confirm = useConfirm()
 *   if (await confirm('Delete this item?')) { ... }
 *
 * Full options:
 *   if (await confirm({
 *     title: 'Delete Designation',
 *     message: 'Are you sure you want to delete this designation?',
 *     variant: 'destructive',
 *     confirmText: 'Delete',
 *   })) { ... }
 */
export function useConfirm() {
  const ctx = useContext(ConfirmContext)
  if (!ctx) {
    throw new Error('useConfirm must be used within a <ConfirmProvider>')
  }
  return ctx.confirm
}
