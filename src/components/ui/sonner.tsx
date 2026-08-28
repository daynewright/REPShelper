"use client"

import type { CSSProperties } from "react"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import {
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
  Loader2Icon,
} from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      richColors
      position="bottom-right"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
          "--success-bg": "color-mix(in oklab, var(--sold) 16%, white)",
          "--success-border": "color-mix(in oklab, var(--sold) 38%, white)",
          "--success-text": "var(--sold)",
          "--error-bg": "color-mix(in oklab, var(--destructive) 14%, white)",
          "--error-border": "color-mix(in oklab, var(--destructive) 36%, white)",
          "--error-text": "var(--destructive)",
          "--warning-bg": "color-mix(in oklab, var(--live) 22%, white)",
          "--warning-border": "color-mix(in oklab, var(--live) 48%, white)",
          "--warning-text": "#8a5a00",
        } as CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast font-sans shadow-lg",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
