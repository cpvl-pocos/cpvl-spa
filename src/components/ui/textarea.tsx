import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, onBlur, ...props }: React.ComponentProps<"textarea">) {
  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    if (onBlur) {
      onBlur(e)
    }
    // Auto-trim value on blur
    const target = e.target
    if (target.value && target.value !== target.value.trim()) {
      const nativeTextareaValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        'value'
      )?.set
      if (nativeTextareaValueSetter) {
        nativeTextareaValueSetter.call(target, target.value.trim())
        target.dispatchEvent(new Event('input', { bubbles: true }))
      }
    }
  }

  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      onBlur={handleBlur}
      {...props}
    />
  )
}

export { Textarea }
