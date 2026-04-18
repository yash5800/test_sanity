"use client"

import * as React from "react"
import { AlertTriangle, Bell, CheckCircle2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/app/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        const Icon = props.variant === 'destructive'
          ? AlertTriangle
          : props.variant === 'success'
            ? CheckCircle2
            : Bell

        return (
          <Toast key={id} {...props}>
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-background/70 shadow-sm">
              <Icon
                className={props.variant === 'destructive'
                  ? 'h-4 w-4 text-destructive'
                  : props.variant === 'success'
                    ? 'h-4 w-4 text-emerald-600 dark:text-emerald-300'
                    : 'h-4 w-4 text-primary'}
              />
            </div>

            <div className="grid min-w-0 gap-1 pr-2">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
